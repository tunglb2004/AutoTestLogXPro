import { CallOptions, HttpClient } from './http.client';

/** Một hàm cho mỗi API trong báo cáo. Chỉ gọi và trả response. */
export class CustomerClient {
  constructor(private readonly http: HttpClient) {}

  /** `DELETE /api/customers/{id}/contacts/{contactId}` */
  deleteContacts(o: CallOptions = {}) {
    return this.http.call("DELETE /api/customers/{id}/contacts/{contactId}", o);
  }

  /** `GET /api/customers` */
  list(o: CallOptions = {}) {
    return this.http.call("GET /api/customers", o);
  }

  /** `GET /api/customers/assignable-managers` */
  getAssignableManagers(o: CallOptions = {}) {
    return this.http.call("GET /api/customers/assignable-managers", o);
  }

  /** `GET /api/customers/export` */
  getExport(o: CallOptions = {}) {
    return this.http.call("GET /api/customers/export", o);
  }

  /** `GET /api/customers/{id}` */
  get(o: CallOptions = {}) {
    return this.http.call("GET /api/customers/{id}", o);
  }

  /** `GET /api/customers/{id}/documents/{documentId}` */
  getDocuments(o: CallOptions = {}) {
    return this.http.call("GET /api/customers/{id}/documents/{documentId}", o);
  }

  /** `GET /api/customers/{id}/history` */
  getHistory(o: CallOptions = {}) {
    return this.http.call("GET /api/customers/{id}/history", o);
  }

  /** `POST /api/customers/{id}/contacts` */
  postContacts(o: CallOptions = {}) {
    return this.http.call("POST /api/customers/{id}/contacts", o);
  }

  /** `POST /api/customers/{id}/contacts/{contactId}/primary` */
  postContactsPrimary(o: CallOptions = {}) {
    return this.http.call("POST /api/customers/{id}/contacts/{contactId}/primary", o);
  }

  /** `POST /api/customers/{id}/transfer-account-manager` */
  postTransferAccountManager(o: CallOptions = {}) {
    return this.http.call("POST /api/customers/{id}/transfer-account-manager", o);
  }

  /** `PUT /api/customers/{id}` */
  update(o: CallOptions = {}) {
    return this.http.call("PUT /api/customers/{id}", o);
  }

  /** `PUT /api/customers/{id}/contacts/{contactId}` */
  putContacts(o: CallOptions = {}) {
    return this.http.call("PUT /api/customers/{id}/contacts/{contactId}", o);
  }

  /** `PUT /api/customers/{id}/credit-limit` */
  putCreditLimit(o: CallOptions = {}) {
    return this.http.call("PUT /api/customers/{id}/credit-limit", o);
  }

  /** `PUT /api/customers/{id}/tier` */
  putTier(o: CallOptions = {}) {
    return this.http.call("PUT /api/customers/{id}/tier", o);
  }
}
