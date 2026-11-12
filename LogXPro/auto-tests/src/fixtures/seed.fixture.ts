import { APIResponse } from '@playwright/test';
import { CallOptions, FilePart, HttpClient, data, items, jsonPart } from '../api/http.client';
import { Roles, createRenewer } from './auth.fixture';
import { test as apiTest } from './api.fixture';
import { contactBody, leadBody } from '../data/lead.factory';
import { annexMeta, resignContract, uploadContract } from '../data/contract.factory';
import { contractorBody } from '../data/contractor.factory';
import { newContractorContract } from '../data/contractor-contract.factory';
import { pdf } from '../data/file.factory';
import { addDays, today } from '../utils/dates';
import { uuid } from '../utils/test-run';

export type Prepared = CallOptions & { token: string | null; expectedFile?: FilePart; resourceId?: string };

let catalogCache: { industryIds: string[]; industryName: string; otherIndustryId?: string; serviceTypes: string[] } | undefined;

async function ok(res: APIResponse, what: string): Promise<any> {
  if (!res.ok()) throw new Error(`Chuẩn bị dữ liệu thất bại (${what}): HTTP ${res.status()} ${(await res.text()).slice(0, 300)}`);
  return data(res);
}

/** Dựng dữ liệu nền qua API cho từng test. Mỗi lần gọi tạo bản ghi mới gắn testRunId. */
export class Seed {
  constructor(private readonly http: HttpClient, readonly roles: Roles) {}

  // ---------- danh mục
  async catalog() {
    if (catalogCache) return catalogCache;
    const t = this.roles.nvkdA.accessToken;
    const ind = items(await ok(await this.http.call('GET /api/catalogues/industries', { token: t }), 'danh mục ngành hàng'));
    const st = items(await ok(await this.http.call('GET /api/catalogues/service-types', { token: this.roles.qlnt.accessToken }), 'loại hình dịch vụ'));
    const other = ind.find((i: any) => /khác/i.test(i.name));
    const usable = ind.filter((i: any) => i.active !== false && i !== other);
    catalogCache = {
      industryIds: usable.map((i: any) => i.id),
      industryName: usable[0]?.name ?? '',
      otherIndustryId: other?.id,
      serviceTypes: st.filter((s: any) => s.active !== false).map((s: any) => s.code),
    };
    if (!catalogCache.industryIds.length) throw new Error('Danh mục ngành hàng rỗng trên môi trường test');
    return catalogCache;
  }

  // ---------- Lead
  async leadBody(owner: keyof Roles = 'nvkdA', overrides: Record<string, unknown> = {}) {
    const { industryIds } = await this.catalog();
    return leadBody(this.roles[owner].userId, [industryIds[0]], overrides);
  }

  async lead(owner: keyof Roles = 'nvkdA', overrides: Record<string, unknown> = {}) {
    const body = await this.leadBody(owner, overrides);
    return ok(await this.http.call('POST /api/leads', { token: this.roles[owner].accessToken, json: body }), 'tạo Lead');
  }

  async leadWithContacts(count: number, owner: keyof Roles = 'nvkdA') {
    let lead = await this.lead(owner);
    for (let i = 1; i < count; i++) {
      lead = await ok(await this.http.call('POST /api/leads/{id}/contacts', { token: this.roles[owner].accessToken, params: { id: lead.id }, json: contactBody() }), 'thêm đầu mối Lead');
    }
    return this.getLead(lead.id, owner);
  }

  async leadWithDocument(owner: keyof Roles = 'nvkdA') {
    const lead = await this.lead(owner);
    const file = pdf('ho-so-khach-hang.pdf');
    const after = await ok(await this.http.call('POST /api/leads/{id}/documents', { token: this.roles[owner].accessToken, params: { id: lead.id }, multipart: { file } }), 'đính kèm tài liệu Lead');
    return { lead: after, doc: after.documents[after.documents.length - 1], file };
  }

  async inactiveLead(owner: keyof Roles = 'nvkdA') {
    const lead = await this.lead(owner);
    await ok(await this.http.call('POST /api/leads/{id}/deactivate', { token: this.roles[owner].accessToken, params: { id: lead.id }, json: { reason: 'Khách tạm dừng nhu cầu vận chuyển' } }), 'ngưng Lead');
    return this.getLead(lead.id, owner);
  }

  async getLead(id: string, owner: keyof Roles = 'nvkdA') {
    return ok(await this.http.call('GET /api/leads/{id}', { token: this.roles[owner].accessToken, params: { id } }), 'đọc Lead');
  }

  // ---------- HĐ khách hàng / khách hàng
  /** Lead mới → upload HĐ đầu tiên. pending=true thì Ngày hiệu lực +10 ngày. */
  async customer(opts: { pending?: boolean; tier?: 'REGULAR' | 'STRATEGIC'; manager?: keyof Roles; lead?: Record<string, unknown> } = {}) {
    const lead = await this.lead('nvkdA', opts.lead ?? {});
    // HĐ đang hiệu lực bắt đầu từ 30 ngày trước để các case tái ký "hiệu lực hôm nay" hợp lệ
    // (ngày hiệu lực HĐ mới phải sau ngày hiệu lực HĐ gốc).
    const from = opts.pending ? addDays(today(), 10) : addDays(today(), -30);
    const contract = uploadContract(lead.id, this.roles[opts.manager ?? 'dvkhA'].userId, { signedOn: opts.pending ? today() : from, effectiveFrom: from, customerTier: opts.tier ?? 'REGULAR' });
    const created = await ok(
      await this.http.call('POST /api/contracts', { token: this.roles.nvkdA.accessToken, multipart: { contract: jsonPart('contract', contract), file: pdf() } }),
      'upload HĐ đầu tiên',
    );
    return { lead, contract: created, customerId: created.customerId as string };
  }

  async contractWithAnnex() {
    const c = await this.customer();
    const file = pdf('phu-luc-1.pdf');
    await ok(await this.http.call('POST /api/contracts/{id}/annexes', { token: this.roles.dvkhA.accessToken, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', annexMeta()), file } }), 'thêm phụ lục HĐ');
    const contract = await this.getContract(c.contract.id);
    return { ...c, contract, annex: contract.annexes[contract.annexes.length - 1], file };
  }

  async contractWithExtensionFile() {
    const c = await this.customer();
    const file = pdf('phu-luc-gia-han.pdf');
    await ok(
      await this.http.call('POST /api/contracts/{id}/extensions', { token: this.roles.dvkhA.accessToken, params: { id: c.contract.id }, multipart: { extension: jsonPart('extension', { newExpiry: addDays(c.contract.effectiveTo, 90), note: 'Gia hạn thêm 3 tháng' }), file } }),
      'gia hạn HĐ có file',
    );
    const contract = await this.getContract(c.contract.id);
    return { ...c, contract, sequence: contract.extensions[contract.extensions.length - 1].sequence, file };
  }

  async getContract(id: string, role: keyof Roles = 'dvkhA') {
    return ok(await this.http.call('GET /api/contracts/{id}', { token: this.roles[role].accessToken, params: { id } }), 'đọc HĐ khách hàng');
  }

  async getCustomer(id: string, role: keyof Roles = 'dvkhA') {
    return ok(await this.http.call('GET /api/customers/{id}', { token: this.roles[role].accessToken, params: { id } }), 'đọc khách hàng');
  }

  async customerWithContacts(count: number) {
    const c = await this.customer();
    for (let i = 1; i < count; i++) {
      await ok(await this.http.call('POST /api/customers/{id}/contacts', { token: this.roles.dvkhA.accessToken, params: { id: c.customerId }, json: contactBody() }), 'thêm đầu mối KH');
    }
    return { ...c, customer: await this.getCustomer(c.customerId) };
  }

  // ---------- Nhà thầu / HĐ nhà thầu
  async contractorBody(overrides: Record<string, unknown> = {}) {
    const { serviceTypes } = await this.catalog();
    return contractorBody([serviceTypes[0]], overrides);
  }

  async contractor(overrides: Record<string, unknown> = {}) {
    return ok(await this.http.call('POST /api/contractors', { token: this.roles.qlnt.accessToken, json: await this.contractorBody(overrides) }), 'tạo nhà thầu');
  }

  async getContractor(id: string) {
    return ok(await this.http.call('GET /api/contractors/{id}', { token: this.roles.qlnt.accessToken, params: { id } }), 'đọc nhà thầu');
  }

  /** Nhà thầu + HĐ đầu tiên. pending=true thì HĐ Chưa hiệu lực. */
  async contractorWithContract(opts: { pending?: boolean; extra?: Record<string, unknown> } = {}) {
    const contractor = await this.contractor();
    const from = opts.pending ? addDays(today(), 10) : addDays(today(), -30);
    const body = newContractorContract(contractor.id, { signedOn: opts.pending ? today() : from, effectiveFrom: from, ...(opts.extra ?? {}) });
    const contract = await ok(
      await this.http.call('POST /api/contractor-contracts', { token: this.roles.qlnt.accessToken, multipart: { contract: jsonPart('contract', body), file: pdf('hop-dong-nha-thau.pdf') } }),
      'thêm HĐ nhà thầu',
    );
    return { contractor: await this.getContractor(contractor.id), contract };
  }

  async terminatedContractor() {
    const c = await this.contractorWithContract();
    await ok(await this.http.call('POST /api/contractors/{id}/terminate', { token: this.roles.qlnt.accessToken, params: { id: c.contractor.id }, json: { reason: 'Vi phạm chất lượng dịch vụ' } }), 'dừng hợp tác');
    return { contractor: await this.getContractor(c.contractor.id), contract: await this.getContractorContract(c.contract.id) };
  }

  async contractorWithDocument() {
    const contractor = await this.contractor();
    const file = pdf('giay-phep-kinh-doanh.pdf');
    const after = await ok(await this.http.call('POST /api/contractors/{id}/documents', { token: this.roles.qlnt.accessToken, params: { id: contractor.id }, multipart: { file } }), 'đính kèm tài liệu nhà thầu');
    return { contractor: after, doc: after.documents[after.documents.length - 1], file };
  }

  async contractorContractWithAnnex(file: FilePart = pdf('phu-luc-gia.pdf')) {
    const c = await this.contractorWithContract();
    await ok(await this.http.call('POST /api/contractor-contracts/{id}/annexes', { token: this.roles.qlnt.accessToken, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', annexMeta()), file } }), 'thêm phụ lục HĐ nhà thầu');
    const contract = await this.getContractorContract(c.contract.id);
    return { ...c, contract, annex: contract.annexes[contract.annexes.length - 1], file };
  }

  async getContractorContract(id: string) {
    return ok(await this.http.call('GET /api/contractor-contracts/{id}', { token: this.roles.qlnt.accessToken, params: { id } }), 'đọc HĐ nhà thầu');
  }

  /**
   * Request hợp lệ cho từng API trong phạm vi, dùng cho case dùng chung
   * (Authentication, Error handling, Response contract, Happy path).
   */
  async prepare(api: string): Promise<Prepared> {
    const nv = this.roles.nvkdA.accessToken;
    const dv = this.roles.dvkhA.accessToken;
    const qt = this.roles.qlnt.accessToken;
    const hq = { page: 1, perPage: 20 };
    switch (api) {
      // ----- Lead
      case 'GET /api/leads': return { token: nv, query: hq };
      case 'POST /api/leads': return { token: nv, json: await this.leadBody() };
      case 'GET /api/leads/assignable-owners': return { token: nv };
      case 'GET /api/leads/export': await this.lead(); return { token: nv };
      case 'POST /api/leads/import': {
        const tpl = await this.http.call('GET /api/leads/import-template', { token: nv });
        const { importFile, importRow } = await import('../data/lead.factory');
        const { xlsx } = await import('../data/file.factory');
        const ind = (await this.catalog()).industryName;
        const buf = await importFile(Buffer.from(await tpl.body()), [importRow(ind)]);
        return { token: nv, multipart: { file: xlsx(buf, 'import-lead.xlsx') } };
      }
      case 'GET /api/leads/import-template': return { token: nv };
      case 'GET /api/leads/stats': return { token: nv };
      case 'GET /api/leads/{id}': { const l = await this.lead(); return { token: nv, params: { id: l.id }, resourceId: l.id }; }
      case 'PUT /api/leads/{id}': {
        const l = await this.lead();
        const { leadUpdateBody } = await import('../data/lead.factory');
        return { token: nv, params: { id: l.id }, json: leadUpdateBody(l, { headOfficeAddress: 'Số 12 đường Lê Lợi, Lạng Sơn' }), resourceId: l.id };
      }
      case 'POST /api/leads/{id}/contacts': { const l = await this.lead(); return { token: nv, params: { id: l.id }, json: contactBody(), resourceId: l.id }; }
      case 'PUT /api/leads/{id}/contacts/{contactId}': { const l = await this.leadWithContacts(2); return { token: nv, params: { id: l.id, contactId: l.contacts[1].id }, json: contactBody(), resourceId: l.id }; }
      case 'DELETE /api/leads/{id}/contacts/{contactId}': { const l = await this.leadWithContacts(2); const sub = l.contacts.find((c: any) => !c.primary); return { token: nv, params: { id: l.id, contactId: sub.id }, resourceId: l.id }; }
      case 'POST /api/leads/{id}/contacts/{contactId}/primary': { const l = await this.leadWithContacts(2); const sub = l.contacts.find((c: any) => !c.primary); return { token: nv, params: { id: l.id, contactId: sub.id }, resourceId: l.id }; }
      case 'POST /api/leads/{id}/deactivate': { const l = await this.lead(); return { token: nv, params: { id: l.id }, json: { reason: 'Khách không còn nhu cầu' }, resourceId: l.id }; }
      case 'POST /api/leads/{id}/documents': { const l = await this.lead(); return { token: nv, params: { id: l.id }, multipart: { file: pdf('ho-so.pdf') }, resourceId: l.id }; }
      case 'GET /api/leads/{id}/documents/{documentId}': { const d = await this.leadWithDocument(); return { token: nv, params: { id: d.lead.id, documentId: d.doc.id }, expectedFile: d.file, resourceId: d.lead.id }; }
      case 'DELETE /api/leads/{id}/documents/{documentId}': { const d = await this.leadWithDocument(); return { token: nv, params: { id: d.lead.id, documentId: d.doc.id }, resourceId: d.lead.id }; }
      case 'GET /api/leads/{id}/history': { const l = await this.lead(); return { token: nv, params: { id: l.id }, query: hq, resourceId: l.id }; }
      case 'POST /api/leads/{id}/reactivate': { const l = await this.inactiveLead(); return { token: nv, params: { id: l.id }, resourceId: l.id }; }
      case 'POST /api/leads/{id}/transfer-owner': { const l = await this.lead(); return { token: nv, params: { id: l.id }, json: { newOwnerUserId: this.roles.nvkdB.userId, reason: 'Phân lại địa bàn' }, resourceId: l.id }; }
      // ----- HĐ khách hàng
      case 'GET /api/contracts': return { token: dv, query: hq };
      case 'POST /api/contracts': {
        const l = await this.lead();
        return { token: nv, multipart: { contract: jsonPart('contract', uploadContract(l.id, this.roles.dvkhA.userId)), file: pdf() }, resourceId: l.id };
      }
      case 'GET /api/contracts/assignable-managers': return { token: nv };
      case 'GET /api/contracts/export': await this.customer(); return { token: dv };
      case 'GET /api/contracts/stats': return { token: dv };
      case 'GET /api/contracts/uploadable-customers': await this.lead(); return { token: nv };
      case 'GET /api/contracts/{id}': { const c = await this.customer(); return { token: dv, params: { id: c.contract.id }, resourceId: c.contract.id }; }
      case 'PUT /api/contracts/{id}': {
        const c = await this.customer();
        const { updateContract } = await import('../data/contract.factory');
        const cur = await this.getContract(c.contract.id);
        return { token: dv, params: { id: c.contract.id }, json: updateContract(cur, { paymentTermDays: 45 }), resourceId: c.contract.id };
      }
      case 'POST /api/contracts/{id}/annexes': { const c = await this.customer(); return { token: dv, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', annexMeta()), file: pdf('phu-luc.pdf') }, resourceId: c.contract.id }; }
      case 'PUT /api/contracts/{id}/annexes/{annexId}': { const c = await this.contractWithAnnex(); return { token: dv, params: { id: c.contract.id, annexId: c.annex.id }, json: annexMeta({ name: 'Phụ lục điều chỉnh đã sửa' }), resourceId: c.contract.id }; }
      case 'DELETE /api/contracts/{id}/annexes/{annexId}': { const c = await this.contractWithAnnex(); return { token: dv, params: { id: c.contract.id, annexId: c.annex.id }, resourceId: c.contract.id }; }
      case 'GET /api/contracts/{id}/annexes/{annexId}/file': { const c = await this.contractWithAnnex(); return { token: dv, params: { id: c.contract.id, annexId: c.annex.id }, expectedFile: c.file, resourceId: c.contract.id }; }
      case 'POST /api/contracts/{id}/cancel': { const c = await this.customer({ pending: true }); return { token: dv, params: { id: c.contract.id }, json: { reason: 'Khách đổi ý trước ngày hiệu lực' }, resourceId: c.contract.id }; }
      case 'POST /api/contracts/{id}/extensions': { const c = await this.customer(); return { token: dv, params: { id: c.contract.id }, json: { newExpiry: addDays(c.contract.effectiveTo, 180), note: 'Gia hạn 6 tháng' }, resourceId: c.contract.id }; }
      case 'GET /api/contracts/{id}/extensions/{sequence}/file': { const c = await this.contractWithExtensionFile(); return { token: dv, params: { id: c.contract.id, sequence: c.sequence }, expectedFile: c.file, resourceId: c.contract.id }; }
      case 'GET /api/contracts/{id}/file': { const c = await this.customer(); return { token: dv, params: { id: c.contract.id }, expectedFile: pdf(), resourceId: c.contract.id }; }
      case 'GET /api/contracts/{id}/history': { const c = await this.customer(); return { token: dv, params: { id: c.contract.id }, query: hq, resourceId: c.contract.id }; }
      case 'POST /api/contracts/{id}/resign': {
        const c = await this.customer();
        return { token: dv, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', resignContract(addDays(c.contract.effectiveTo, 1))), file: pdf('hop-dong-tai-ky.pdf') }, resourceId: c.contract.id };
      }
      case 'POST /api/contracts/{id}/suspend': { const c = await this.customer(); return { token: dv, params: { id: c.contract.id }, json: { reason: 'Vi phạm thanh toán' }, resourceId: c.contract.id }; }
      // ----- Khách hàng
      case 'GET /api/customers': return { token: dv, query: hq };
      case 'GET /api/customers/assignable-managers': return { token: dv };
      case 'GET /api/customers/export': await this.customer(); return { token: dv };
      case 'GET /api/customers/{id}': { const c = await this.customer(); return { token: dv, params: { id: c.customerId }, resourceId: c.customerId }; }
      case 'PUT /api/customers/{id}': {
        const c = await this.customer();
        const { customerUpdateBody } = await import('../data/customer.factory');
        return { token: dv, params: { id: c.customerId }, json: customerUpdateBody(await this.getCustomer(c.customerId), { headOfficeAddress: 'Số 8 đường Trần Hưng Đạo, Hải Phòng' }), resourceId: c.customerId };
      }
      case 'POST /api/customers/{id}/contacts': { const c = await this.customer(); return { token: dv, params: { id: c.customerId }, json: contactBody(), resourceId: c.customerId }; }
      case 'PUT /api/customers/{id}/contacts/{contactId}': { const c = await this.customerWithContacts(2); return { token: dv, params: { id: c.customerId, contactId: c.customer.contacts[1].id }, json: contactBody(), resourceId: c.customerId }; }
      case 'DELETE /api/customers/{id}/contacts/{contactId}': { const c = await this.customerWithContacts(2); const sub = c.customer.contacts.find((x: any) => !x.primary); return { token: dv, params: { id: c.customerId, contactId: sub.id }, resourceId: c.customerId }; }
      case 'POST /api/customers/{id}/contacts/{contactId}/primary': { const c = await this.customerWithContacts(2); const sub = c.customer.contacts.find((x: any) => !x.primary); return { token: dv, params: { id: c.customerId, contactId: sub.id }, resourceId: c.customerId }; }
      case 'PUT /api/customers/{id}/credit-limit': { const c = await this.customer(); const { creditLimit } = await import('../data/customer.factory'); return { token: dv, params: { id: c.customerId }, json: { creditLimit: creditLimit() }, resourceId: c.customerId }; }
      case 'GET /api/customers/{id}/documents/{documentId}': {
        const d = await this.leadWithDocument();
        await ok(await this.http.call('POST /api/contracts', { token: nv, multipart: { contract: jsonPart('contract', uploadContract(d.lead.id, this.roles.dvkhA.userId)), file: pdf() } }), 'chuyển Lead có tài liệu');
        return { token: dv, params: { id: d.lead.id, documentId: d.doc.id }, expectedFile: d.file, resourceId: d.lead.id };
      }
      case 'GET /api/customers/{id}/history': { const c = await this.customer(); return { token: dv, params: { id: c.customerId }, query: hq, resourceId: c.customerId }; }
      case 'PUT /api/customers/{id}/tier': { const c = await this.customer({ tier: 'REGULAR' }); return { token: dv, params: { id: c.customerId }, json: { tier: 'STRATEGIC' }, resourceId: c.customerId }; }
      case 'POST /api/customers/{id}/transfer-account-manager': { const c = await this.customer(); return { token: dv, params: { id: c.customerId }, json: { newAccountManagerId: this.roles.dvkhB.userId, reason: 'Phân lại danh mục' }, resourceId: c.customerId }; }
      // ----- Nhà thầu
      case 'GET /api/contractors': return { token: qt, query: hq };
      case 'POST /api/contractors': return { token: qt, json: await this.contractorBody() };
      case 'GET /api/contractors/export': await this.contractor(); return { token: qt };
      case 'GET /api/contractors/stats': return { token: qt };
      case 'GET /api/contractors/{id}': { const c = await this.contractorWithContract(); return { token: qt, params: { id: c.contractor.id }, resourceId: c.contractor.id }; }
      case 'PUT /api/contractors/{id}': {
        const c = await this.contractorWithContract();
        const { contractorUpdateBody } = await import('../data/contractor.factory');
        return { token: qt, params: { id: c.contractor.id }, json: contractorUpdateBody(c.contractor, { capabilityDescription: 'Bổ sung năng lực lưu kho lạnh' }), resourceId: c.contractor.id };
      }
      case 'DELETE /api/contractors/{id}': { const c = await this.contractor(); return { token: qt, params: { id: c.id }, resourceId: c.id }; }
      case 'POST /api/contractors/{id}/contacts': { const c = await this.contractorWithContract(); return { token: qt, params: { id: c.contractor.id }, json: contactBody(), resourceId: c.contractor.id }; }
      case 'PUT /api/contractors/{id}/contacts/{contactId}': {
        const c = await this.contractorWithContract();
        const after = await ok(await this.http.call('POST /api/contractors/{id}/contacts', { token: qt, params: { id: c.contractor.id }, json: contactBody() }), 'thêm đầu mối nhà thầu');
        const sub = (after.contacts ?? (await this.getContractor(c.contractor.id)).contacts).find((x: any) => !x.primary);
        return { token: qt, params: { id: c.contractor.id, contactId: sub.id }, json: contactBody({ note: 'Liên hệ ngoài giờ hành chính' }), resourceId: c.contractor.id };
      }
      case 'DELETE /api/contractors/{id}/contacts/{contactId}': {
        const c = await this.contractorWithContract();
        await ok(await this.http.call('POST /api/contractors/{id}/contacts', { token: qt, params: { id: c.contractor.id }, json: contactBody() }), 'thêm đầu mối nhà thầu');
        const sub = (await this.getContractor(c.contractor.id)).contacts.find((x: any) => !x.primary);
        return { token: qt, params: { id: c.contractor.id, contactId: sub.id }, resourceId: c.contractor.id };
      }
      case 'POST /api/contractors/{id}/documents': { const c = await this.contractor(); return { token: qt, params: { id: c.id }, multipart: { file: pdf('giay-phep.pdf') }, resourceId: c.id }; }
      case 'GET /api/contractors/{id}/documents/{documentId}': { const d = await this.contractorWithDocument(); return { token: qt, params: { id: d.contractor.id, documentId: d.doc.id }, expectedFile: d.file, resourceId: d.contractor.id }; }
      case 'DELETE /api/contractors/{id}/documents/{documentId}': { const d = await this.contractorWithDocument(); return { token: qt, params: { id: d.contractor.id, documentId: d.doc.id }, resourceId: d.contractor.id }; }
      case 'GET /api/contractors/{id}/history': { const c = await this.contractorWithContract(); return { token: qt, params: { id: c.contractor.id }, query: hq, resourceId: c.contractor.id }; }
      case 'POST /api/contractors/{id}/reactivate': { const d = await this.terminatedContractor(); return { token: qt, params: { id: d.contractor.id }, json: { reason: 'Hợp tác lại sau khi khắc phục' }, resourceId: d.contractor.id }; }
      case 'POST /api/contractors/{id}/terminate': { const c = await this.contractorWithContract(); return { token: qt, params: { id: c.contractor.id }, json: { reason: 'Vi phạm chất lượng' }, resourceId: c.contractor.id }; }
      case 'PUT /api/contractors/{id}/tier': {
        const c = await this.contractorWithContract();
        const { tierB } = await import('../data/contractor.factory');
        return { token: qt, params: { id: c.contractor.id }, json: { tier: tierB(), reason: 'Năng lực tốt sau kỳ đánh giá' }, resourceId: c.contractor.id };
      }
      // ----- HĐ nhà thầu
      case 'GET /api/contractor-contracts': return { token: qt, query: hq };
      case 'POST /api/contractor-contracts': {
        const c = await this.contractor();
        return { token: qt, multipart: { contract: jsonPart('contract', newContractorContract(c.id)), file: pdf('hop-dong-nha-thau.pdf') }, resourceId: c.id };
      }
      case 'GET /api/contractor-contracts/contractor-options': await this.contractor(); return { token: qt, query: { mode: 'NEW' } };
      case 'GET /api/contractor-contracts/stats': return { token: qt };
      case 'GET /api/contractor-contracts/{id}': { const c = await this.contractorWithContract(); return { token: qt, params: { id: c.contract.id }, resourceId: c.contract.id }; }
      case 'PUT /api/contractor-contracts/{id}': {
        const c = await this.contractorWithContract({ pending: true });
        const { updateContractorContract } = await import('../data/contractor-contract.factory');
        return { token: qt, params: { id: c.contract.id }, json: updateContractorContract(c.contract, { name: 'Hợp đồng vận chuyển đã điều chỉnh tên' }), resourceId: c.contract.id };
      }
      case 'POST /api/contractor-contracts/{id}/annexes': { const c = await this.contractorWithContract(); return { token: qt, params: { id: c.contract.id }, multipart: { annex: jsonPart('annex', annexMeta()), file: pdf('phu-luc.pdf') }, resourceId: c.contract.id }; }
      case 'PUT /api/contractor-contracts/{id}/annexes/{annexId}': { const c = await this.contractorContractWithAnnex(); return { token: qt, params: { id: c.contract.id, annexId: c.annex.id }, json: annexMeta({ name: 'Phụ lục giá đã sửa' }), resourceId: c.contract.id }; }
      case 'DELETE /api/contractor-contracts/{id}/annexes/{annexId}': { const c = await this.contractorContractWithAnnex(); return { token: qt, params: { id: c.contract.id, annexId: c.annex.id }, resourceId: c.contract.id }; }
      case 'GET /api/contractor-contracts/{id}/annexes/{annexId}/file': { const c = await this.contractorContractWithAnnex(); return { token: qt, params: { id: c.contract.id, annexId: c.annex.id }, expectedFile: c.file, resourceId: c.contract.id }; }
      case 'GET /api/contractor-contracts/{id}/annexes/{annexId}/view': { const c = await this.contractorContractWithAnnex(); return { token: qt, params: { id: c.contract.id, annexId: c.annex.id }, expectedFile: c.file, resourceId: c.contract.id }; }
      case 'PUT /api/contractor-contracts/{id}/auto-renewal': { const c = await this.contractorWithContract(); return { token: qt, params: { id: c.contract.id }, json: { enabled: true, cycleMonths: 12 }, resourceId: c.contract.id }; }
      case 'POST /api/contractor-contracts/{id}/cancel': { const c = await this.contractorWithContract({ pending: true }); return { token: qt, params: { id: c.contract.id }, json: { reason: 'Nhà thầu rút trước ngày hiệu lực' }, resourceId: c.contract.id }; }
      case 'POST /api/contractor-contracts/{id}/extensions': { const c = await this.contractorWithContract(); return { token: qt, params: { id: c.contract.id }, json: { newExpiry: addDays(c.contract.effectiveTo, 180), note: 'Gia hạn 6 tháng' }, resourceId: c.contract.id }; }
      case 'GET /api/contractor-contracts/{id}/file': { const c = await this.contractorWithContract(); return { token: qt, params: { id: c.contract.id }, expectedFile: pdf('hop-dong-nha-thau.pdf'), resourceId: c.contract.id }; }
      case 'GET /api/contractor-contracts/{id}/history': { const c = await this.contractorWithContract(); return { token: qt, params: { id: c.contract.id }, query: hq, resourceId: c.contract.id }; }
      case 'POST /api/contractor-contracts/{id}/resign': {
        const c = await this.contractorWithContract();
        const { resignContractorContract } = await import('../data/contractor-contract.factory');
        return { token: qt, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', resignContractorContract(addDays(c.contract.effectiveTo, 1))), file: pdf('hop-dong-tai-ky.pdf') }, resourceId: c.contract.id };
      }
      case 'POST /api/contractor-contracts/{id}/suspend': { const c = await this.contractorWithContract(); return { token: qt, params: { id: c.contract.id }, json: { reason: 'Vi phạm SLA' }, resourceId: c.contract.id }; }
      default:
        throw new Error(`Chưa có dữ liệu chuẩn bị cho ${api}`);
    }
  }

  // ---------- tiện ích đọc lại
  /** Dòng lịch sử của một bản ghi; `base` là tiền tố API, ví dụ '/api/leads'. */
  async history(base: string, id: string, role: keyof Roles): Promise<any[]> {
    const res = await this.http.call(`GET ${base}/{id}/history`, { token: this.roles[role].accessToken, params: { id }, query: { page: 1, perPage: 100 } });
    return items(await ok(res, 'đọc lịch sử'));
  }

  /** Số Lead của NVKD A có MST đúng bằng `taxCode`. */
  async leadsByTax(taxCode: string, owner: keyof Roles = 'nvkdA'): Promise<any[]> {
    const res = await this.http.call('GET /api/leads', { token: this.roles[owner].accessToken, query: { search: taxCode, perPage: 100 } });
    return items(await ok(res, 'tìm Lead theo MST')).filter((l: any) => l.taxCode === taxCode);
  }

  async contractorsByTax(taxCode: string): Promise<any[]> {
    const res = await this.http.call('GET /api/contractors', { token: this.roles.qlnt.accessToken, query: { search: taxCode, perPage: 100 } });
    return items(await ok(res, 'tìm nhà thầu theo MST')).filter((c: any) => c.taxCode === taxCode);
  }

  /**
   * File mẫu dùng để dựng file import: file mẫu người dùng cung cấp (IMPORT_TEMPLATE_FILE, mặc định test-data/Mau_Nhap_Lead.xlsx,
   * gồm sheet Lead 13 cột và sheet Danh mục). Không có file thì dùng file mẫu tải từ API.
   */
  async importTemplateForUpload(): Promise<Buffer> {
    const fs = await import('fs');
    const path = await import('path');
    const file = process.env.IMPORT_TEMPLATE_FILE || path.join(__dirname, '..', '..', 'test-data', 'Mau_Nhap_Lead.xlsx');
    return fs.existsSync(file) ? fs.readFileSync(file) : this.importTemplate();
  }

  async importTemplate(): Promise<Buffer> {
    const res = await this.http.call('GET /api/leads/import-template', { token: this.roles.nvkdA.accessToken });
    if (!res.ok()) throw new Error(`Không tải được file mẫu import: HTTP ${res.status()}`);
    return Buffer.from(await res.body());
  }

  /** File import Lead theo file mẫu, mỗi phần tử là 1 dòng (ghi đè trường của dòng hợp lệ). */
  async importFile(rows: Record<string, string | undefined>[]): Promise<FilePart> {
    const { importFile, importRow } = await import('../data/lead.factory');
    const { xlsx } = await import('../data/file.factory');
    const indName = (await this.catalog()).industryName;
    return xlsx(await importFile(await this.importTemplateForUpload(), rows.map((r) => importRow(indName, r))), 'Mau_Nhap_Lead.xlsx');
  }

  /** Khách hàng có HĐ ACTIVE và HĐ tái ký nối tiếp PENDING. */
  async customerWithPendingResign() {
    const c = await this.customer();
    const resign = await ok(
      await this.http.call('POST /api/contracts/{id}/resign', { token: this.roles.dvkhA.accessToken, params: { id: c.contract.id }, multipart: { contract: jsonPart('contract', resignContract(addDays(c.contract.effectiveTo, 1))), file: pdf('tai-ky.pdf') } }),
      'tái ký nối tiếp',
    );
    return { ...c, pending: resign };
  }

  /** Request "không hợp lệ về quyền": cùng dữ liệu nhưng giả lập id ngẫu nhiên. */
  randomId(): string {
    return uuid();
  }

  /** Đọc trạng thái tài nguyên gốc để so sánh "dữ liệu không đổi". */
  async snapshot(api: string, p: Prepared): Promise<unknown> {
    const id = p.resourceId;
    const path = api.split(' ')[1];
    if (!id) {
      // API tạo mới: đếm bản ghi có đúng MST vừa gửi (đọc lại thất bại thì ném lỗi, không trả số giả).
      const tax = (p.json as any)?.taxCode;
      if (tax && path.startsWith('/api/leads')) return (await this.leadsByTax(tax)).length;
      if (tax && path.startsWith('/api/contractors')) return (await this.contractorsByTax(tax)).length;
      return null;
    }
    const strip = (o: any) => (o && typeof o === 'object' ? { ...o, updatedAt: undefined, daysToExpiry: undefined } : o);
    if (path.startsWith('/api/leads')) return strip(await this.getLead(id));
    if (path.startsWith('/api/contractor-contracts')) return strip(p.params?.id ? await this.getContractorContract(String(p.params.id)) : await this.getContractor(id));
    if (path.startsWith('/api/contractors')) return strip(await this.getContractor(id));
    if (path.startsWith('/api/contracts')) return strip(p.params?.id ? await this.getContract(String(p.params.id)) : await this.getLead(id));
    if (path.startsWith('/api/customers')) return strip(await this.getCustomer(id));
    return null;
  }
}

export const test = apiTest.extend<{ seed: Seed }>({
  // Client riêng, không ghi message: request chuẩn bị dữ liệu không phải đối tượng test.
  seed: async ({ request, roles }, use) => use(new Seed(new HttpClient(request, process.env.API_BASE_URL ?? '', createRenewer(roles)), roles)),
});

export { expect } from '@playwright/test';
