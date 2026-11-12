import { CallOptions, HttpClient } from './http.client';

/** Một hàm cho mỗi API trong báo cáo. Chỉ gọi và trả response. */
export class LeadClient {
  constructor(private readonly http: HttpClient) {}

  /** `DELETE /api/leads/{id}/contacts/{contactId}` */
  deleteContacts(o: CallOptions = {}) {
    return this.http.call("DELETE /api/leads/{id}/contacts/{contactId}", o);
  }

  /** `DELETE /api/leads/{id}/documents/{documentId}` */
  deleteDocuments(o: CallOptions = {}) {
    return this.http.call("DELETE /api/leads/{id}/documents/{documentId}", o);
  }

  /** `GET /api/leads` */
  list(o: CallOptions = {}) {
    return this.http.call("GET /api/leads", o);
  }

  /** `GET /api/leads/assignable-owners` */
  getAssignableOwners(o: CallOptions = {}) {
    return this.http.call("GET /api/leads/assignable-owners", o);
  }

  /** `GET /api/leads/export` */
  getExport(o: CallOptions = {}) {
    return this.http.call("GET /api/leads/export", o);
  }

  /** `GET /api/leads/import-template` */
  getImportTemplate(o: CallOptions = {}) {
    return this.http.call("GET /api/leads/import-template", o);
  }

  /** `GET /api/leads/stats` */
  getStats(o: CallOptions = {}) {
    return this.http.call("GET /api/leads/stats", o);
  }

  /** `GET /api/leads/{id}` */
  get(o: CallOptions = {}) {
    return this.http.call("GET /api/leads/{id}", o);
  }

  /** `GET /api/leads/{id}/documents/{documentId}` */
  getDocuments(o: CallOptions = {}) {
    return this.http.call("GET /api/leads/{id}/documents/{documentId}", o);
  }

  /** `GET /api/leads/{id}/history` */
  getHistory(o: CallOptions = {}) {
    return this.http.call("GET /api/leads/{id}/history", o);
  }

  /** `POST /api/leads` */
  create(o: CallOptions = {}) {
    return this.http.call("POST /api/leads", o);
  }

  /** `POST /api/leads/import` */
  postImport(o: CallOptions = {}) {
    return this.http.call("POST /api/leads/import", o);
  }

  /** `POST /api/leads/{id}/contacts` */
  postContacts(o: CallOptions = {}) {
    return this.http.call("POST /api/leads/{id}/contacts", o);
  }

  /** `POST /api/leads/{id}/contacts/{contactId}/primary` */
  postContactsPrimary(o: CallOptions = {}) {
    return this.http.call("POST /api/leads/{id}/contacts/{contactId}/primary", o);
  }

  /** `POST /api/leads/{id}/deactivate` */
  postDeactivate(o: CallOptions = {}) {
    return this.http.call("POST /api/leads/{id}/deactivate", o);
  }

  /** `POST /api/leads/{id}/documents` */
  postDocuments(o: CallOptions = {}) {
    return this.http.call("POST /api/leads/{id}/documents", o);
  }

  /** `POST /api/leads/{id}/reactivate` */
  postReactivate(o: CallOptions = {}) {
    return this.http.call("POST /api/leads/{id}/reactivate", o);
  }

  /** `POST /api/leads/{id}/transfer-owner` */
  postTransferOwner(o: CallOptions = {}) {
    return this.http.call("POST /api/leads/{id}/transfer-owner", o);
  }

  /** `PUT /api/leads/{id}` */
  update(o: CallOptions = {}) {
    return this.http.call("PUT /api/leads/{id}", o);
  }

  /** `PUT /api/leads/{id}/contacts/{contactId}` */
  putContacts(o: CallOptions = {}) {
    return this.http.call("PUT /api/leads/{id}/contacts/{contactId}", o);
  }
}
