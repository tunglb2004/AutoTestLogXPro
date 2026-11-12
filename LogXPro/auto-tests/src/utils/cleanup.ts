import { HttpClient } from '../api/http.client';

/**
 * Dọn dữ liệu test bằng API xóa có sẵn. Chỉ chạy khi ALLOW_CLEANUP=true.
 * Lead, khách hàng, hợp đồng không có API xóa nên được để lại trên môi trường dev.
 */
export async function cleanupContractor(http: HttpClient, token: string, contractorId: string): Promise<void> {
  if (process.env.ALLOW_CLEANUP !== 'true') return;
  await http.call('DELETE /api/contractors/{id}', { token, params: { id: contractorId } });
}

export function cleanupEnabled(): boolean {
  return process.env.ALLOW_CLEANUP === 'true';
}
