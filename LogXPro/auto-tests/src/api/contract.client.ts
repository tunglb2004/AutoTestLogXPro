import { CallOptions, HttpClient } from './http.client';

/** Một hàm cho mỗi API trong báo cáo. Chỉ gọi và trả response. */
export class ContractClient {
  constructor(private readonly http: HttpClient) {}

  /** `DELETE /api/contracts/{id}/annexes/{annexId}` */
  deleteAnnexes(o: CallOptions = {}) {
    return this.http.call("DELETE /api/contracts/{id}/annexes/{annexId}", o);
  }

  /** `GET /api/contracts` */
  list(o: CallOptions = {}) {
    return this.http.call("GET /api/contracts", o);
  }

  /** `GET /api/contracts/assignable-managers` */
  getAssignableManagers(o: CallOptions = {}) {
    return this.http.call("GET /api/contracts/assignable-managers", o);
  }

  /** `GET /api/contracts/export` */
  getExport(o: CallOptions = {}) {
    return this.http.call("GET /api/contracts/export", o);
  }

  /** `GET /api/contracts/stats` */
  getStats(o: CallOptions = {}) {
    return this.http.call("GET /api/contracts/stats", o);
  }

  /** `GET /api/contracts/uploadable-customers` */
  getUploadableCustomers(o: CallOptions = {}) {
    return this.http.call("GET /api/contracts/uploadable-customers", o);
  }

  /** `GET /api/contracts/{id}` */
  get(o: CallOptions = {}) {
    return this.http.call("GET /api/contracts/{id}", o);
  }

  /** `GET /api/contracts/{id}/annexes/{annexId}/file` */
  getAnnexesFile(o: CallOptions = {}) {
    return this.http.call("GET /api/contracts/{id}/annexes/{annexId}/file", o);
  }

  /** `GET /api/contracts/{id}/extensions/{sequence}/file` */
  getExtensionsFile(o: CallOptions = {}) {
    return this.http.call("GET /api/contracts/{id}/extensions/{sequence}/file", o);
  }

  /** `GET /api/contracts/{id}/file` */
  getFile(o: CallOptions = {}) {
    return this.http.call("GET /api/contracts/{id}/file", o);
  }

  /** `GET /api/contracts/{id}/history` */
  getHistory(o: CallOptions = {}) {
    return this.http.call("GET /api/contracts/{id}/history", o);
  }

  /** `POST /api/contracts` */
  create(o: CallOptions = {}) {
    return this.http.call("POST /api/contracts", o);
  }

  /** `POST /api/contracts/{id}/annexes` */
  postAnnexes(o: CallOptions = {}) {
    return this.http.call("POST /api/contracts/{id}/annexes", o);
  }

  /** `POST /api/contracts/{id}/cancel` */
  postCancel(o: CallOptions = {}) {
    return this.http.call("POST /api/contracts/{id}/cancel", o);
  }

  /** `POST /api/contracts/{id}/extensions` */
  postExtensions(o: CallOptions = {}) {
    return this.http.call("POST /api/contracts/{id}/extensions", o);
  }

  /** `POST /api/contracts/{id}/resign` */
  postResign(o: CallOptions = {}) {
    return this.http.call("POST /api/contracts/{id}/resign", o);
  }

  /** `POST /api/contracts/{id}/suspend` */
  postSuspend(o: CallOptions = {}) {
    return this.http.call("POST /api/contracts/{id}/suspend", o);
  }

  /** `PUT /api/contracts/{id}` */
  update(o: CallOptions = {}) {
    return this.http.call("PUT /api/contracts/{id}", o);
  }

  /** `PUT /api/contracts/{id}/annexes/{annexId}` */
  putAnnexes(o: CallOptions = {}) {
    return this.http.call("PUT /api/contracts/{id}/annexes/{annexId}", o);
  }
}
