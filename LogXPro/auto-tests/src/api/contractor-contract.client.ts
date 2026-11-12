import { CallOptions, HttpClient } from './http.client';

/** Một hàm cho mỗi API trong báo cáo. Chỉ gọi và trả response. */
export class ContractorContractClient {
  constructor(private readonly http: HttpClient) {}

  /** `DELETE /api/contractor-contracts/{id}/annexes/{annexId}` */
  deleteAnnexes(o: CallOptions = {}) {
    return this.http.call("DELETE /api/contractor-contracts/{id}/annexes/{annexId}", o);
  }

  /** `GET /api/contractor-contracts` */
  list(o: CallOptions = {}) {
    return this.http.call("GET /api/contractor-contracts", o);
  }

  /** `GET /api/contractor-contracts/contractor-options` */
  getContractorOptions(o: CallOptions = {}) {
    return this.http.call("GET /api/contractor-contracts/contractor-options", o);
  }

  /** `GET /api/contractor-contracts/stats` */
  getStats(o: CallOptions = {}) {
    return this.http.call("GET /api/contractor-contracts/stats", o);
  }

  /** `GET /api/contractor-contracts/{id}` */
  get(o: CallOptions = {}) {
    return this.http.call("GET /api/contractor-contracts/{id}", o);
  }

  /** `GET /api/contractor-contracts/{id}/annexes/{annexId}/file` */
  getAnnexesFile(o: CallOptions = {}) {
    return this.http.call("GET /api/contractor-contracts/{id}/annexes/{annexId}/file", o);
  }

  /** `GET /api/contractor-contracts/{id}/annexes/{annexId}/view` */
  getAnnexesView(o: CallOptions = {}) {
    return this.http.call("GET /api/contractor-contracts/{id}/annexes/{annexId}/view", o);
  }

  /** `GET /api/contractor-contracts/{id}/file` */
  getFile(o: CallOptions = {}) {
    return this.http.call("GET /api/contractor-contracts/{id}/file", o);
  }

  /** `GET /api/contractor-contracts/{id}/history` */
  getHistory(o: CallOptions = {}) {
    return this.http.call("GET /api/contractor-contracts/{id}/history", o);
  }

  /** `POST /api/contractor-contracts` */
  create(o: CallOptions = {}) {
    return this.http.call("POST /api/contractor-contracts", o);
  }

  /** `POST /api/contractor-contracts/{id}/annexes` */
  postAnnexes(o: CallOptions = {}) {
    return this.http.call("POST /api/contractor-contracts/{id}/annexes", o);
  }

  /** `POST /api/contractor-contracts/{id}/cancel` */
  postCancel(o: CallOptions = {}) {
    return this.http.call("POST /api/contractor-contracts/{id}/cancel", o);
  }

  /** `POST /api/contractor-contracts/{id}/extensions` */
  postExtensions(o: CallOptions = {}) {
    return this.http.call("POST /api/contractor-contracts/{id}/extensions", o);
  }

  /** `POST /api/contractor-contracts/{id}/resign` */
  postResign(o: CallOptions = {}) {
    return this.http.call("POST /api/contractor-contracts/{id}/resign", o);
  }

  /** `POST /api/contractor-contracts/{id}/suspend` */
  postSuspend(o: CallOptions = {}) {
    return this.http.call("POST /api/contractor-contracts/{id}/suspend", o);
  }

  /** `PUT /api/contractor-contracts/{id}` */
  update(o: CallOptions = {}) {
    return this.http.call("PUT /api/contractor-contracts/{id}", o);
  }

  /** `PUT /api/contractor-contracts/{id}/annexes/{annexId}` */
  putAnnexes(o: CallOptions = {}) {
    return this.http.call("PUT /api/contractor-contracts/{id}/annexes/{annexId}", o);
  }

  /** `PUT /api/contractor-contracts/{id}/auto-renewal` */
  putAutoRenewal(o: CallOptions = {}) {
    return this.http.call("PUT /api/contractor-contracts/{id}/auto-renewal", o);
  }
}
