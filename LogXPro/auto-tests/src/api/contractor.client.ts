import { CallOptions, HttpClient } from './http.client';

/** Một hàm cho mỗi API trong báo cáo. Chỉ gọi và trả response. */
export class ContractorClient {
  constructor(private readonly http: HttpClient) {}

  /** `DELETE /api/contractors/{id}` */
  remove(o: CallOptions = {}) {
    return this.http.call("DELETE /api/contractors/{id}", o);
  }

  /** `DELETE /api/contractors/{id}/contacts/{contactId}` */
  deleteContacts(o: CallOptions = {}) {
    return this.http.call("DELETE /api/contractors/{id}/contacts/{contactId}", o);
  }

  /** `DELETE /api/contractors/{id}/documents/{documentId}` */
  deleteDocuments(o: CallOptions = {}) {
    return this.http.call("DELETE /api/contractors/{id}/documents/{documentId}", o);
  }

  /** `GET /api/contractors` */
  list(o: CallOptions = {}) {
    return this.http.call("GET /api/contractors", o);
  }

  /** `GET /api/contractors/export` */
  getExport(o: CallOptions = {}) {
    return this.http.call("GET /api/contractors/export", o);
  }

  /** `GET /api/contractors/stats` */
  getStats(o: CallOptions = {}) {
    return this.http.call("GET /api/contractors/stats", o);
  }

  /** `GET /api/contractors/{id}` */
  get(o: CallOptions = {}) {
    return this.http.call("GET /api/contractors/{id}", o);
  }

  /** `GET /api/contractors/{id}/documents/{documentId}` */
  getDocuments(o: CallOptions = {}) {
    return this.http.call("GET /api/contractors/{id}/documents/{documentId}", o);
  }

  /** `GET /api/contractors/{id}/history` */
  getHistory(o: CallOptions = {}) {
    return this.http.call("GET /api/contractors/{id}/history", o);
  }

  /** `POST /api/contractors` */
  create(o: CallOptions = {}) {
    return this.http.call("POST /api/contractors", o);
  }

  /** `POST /api/contractors/{id}/contacts` */
  postContacts(o: CallOptions = {}) {
    return this.http.call("POST /api/contractors/{id}/contacts", o);
  }

  /** `POST /api/contractors/{id}/documents` */
  postDocuments(o: CallOptions = {}) {
    return this.http.call("POST /api/contractors/{id}/documents", o);
  }

  /** `POST /api/contractors/{id}/reactivate` */
  postReactivate(o: CallOptions = {}) {
    return this.http.call("POST /api/contractors/{id}/reactivate", o);
  }

  /** `POST /api/contractors/{id}/terminate` */
  postTerminate(o: CallOptions = {}) {
    return this.http.call("POST /api/contractors/{id}/terminate", o);
  }

  /** `PUT /api/contractors/{id}` */
  update(o: CallOptions = {}) {
    return this.http.call("PUT /api/contractors/{id}", o);
  }

  /** `PUT /api/contractors/{id}/contacts/{contactId}` */
  putContacts(o: CallOptions = {}) {
    return this.http.call("PUT /api/contractors/{id}/contacts/{contactId}", o);
  }

  /** `PUT /api/contractors/{id}/tier` */
  putTier(o: CallOptions = {}) {
    return this.http.call("PUT /api/contractors/{id}/tier", o);
  }
}
