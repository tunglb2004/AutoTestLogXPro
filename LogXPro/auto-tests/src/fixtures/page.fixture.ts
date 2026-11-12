import * as fs from 'fs';
import { RoleKey } from './auth.fixture';
import { test as seedTest } from './seed.fixture';
import { LoginPage } from '../pages/login.page';
import { LeadListPage } from '../pages/lead-list.page';
import { LeadFormPage } from '../pages/lead-form.page';
import { LeadDetailPage } from '../pages/lead-detail.page';
import { ContractUploadPage } from '../pages/contract-upload.page';
import { ContractDetailPage } from '../pages/contract-detail.page';
import { CustomerListPage } from '../pages/customer-list.page';
import { CustomerDetailPage } from '../pages/customer-detail.page';
import { ContractorListPage } from '../pages/contractor-list.page';
import { ContractorFormPage } from '../pages/contractor-form.page';
import { ContractorDetailPage } from '../pages/contractor-detail.page';
import { PurchasePriceFormPage } from '../pages/purchase-price-form.page';
import { ContractorContractFormPage } from '../pages/contractor-contract-form.page';
import { ContractorContractDetailPage } from '../pages/contractor-contract-detail.page';

type Pages = {
  loginPage: LoginPage;
  leadListPage: LeadListPage;
  leadFormPage: LeadFormPage;
  leadDetailPage: LeadDetailPage;
  contractUploadPage: ContractUploadPage;
  contractDetailPage: ContractDetailPage;
  customerListPage: CustomerListPage;
  customerDetailPage: CustomerDetailPage;
  contractorListPage: ContractorListPage;
  contractorFormPage: ContractorFormPage;
  contractorDetailPage: ContractorDetailPage;
  purchasePriceFormPage: PurchasePriceFormPage;
  contractorContractFormPage: ContractorContractFormPage;
  contractorContractDetailPage: ContractorContractDetailPage;
  /** Gắn phiên đăng nhập web của role (cookie lưu ở setup) vào trình duyệt của test. */
  loginAs: (role: RoleKey) => Promise<void>;
};

/** Page Object cho test UI; dữ liệu nền vẫn dựng bằng API qua seed. */
export const test = seedTest.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  leadListPage: async ({ page }, use) => use(new LeadListPage(page)),
  leadFormPage: async ({ page }, use) => use(new LeadFormPage(page)),
  leadDetailPage: async ({ page }, use) => use(new LeadDetailPage(page)),
  contractUploadPage: async ({ page }, use) => use(new ContractUploadPage(page)),
  contractDetailPage: async ({ page }, use) => use(new ContractDetailPage(page)),
  customerListPage: async ({ page }, use) => use(new CustomerListPage(page)),
  customerDetailPage: async ({ page }, use) => use(new CustomerDetailPage(page)),
  contractorListPage: async ({ page }, use) => use(new ContractorListPage(page)),
  contractorFormPage: async ({ page }, use) => use(new ContractorFormPage(page)),
  contractorDetailPage: async ({ page }, use) => use(new ContractorDetailPage(page)),
  purchasePriceFormPage: async ({ page }, use) => use(new PurchasePriceFormPage(page)),
  contractorContractFormPage: async ({ page }, use) => use(new ContractorContractFormPage(page)),
  contractorContractDetailPage: async ({ page }, use) => use(new ContractorContractDetailPage(page)),
  loginAs: async ({ context, roles }, use) =>
    use(async (role) => {
      const state = JSON.parse(fs.readFileSync(roles[role].storageState!, 'utf-8'));
      // Token có thể đã được gia hạn sau setup (đăng nhập lại khi gặp 401): dùng token mới nhất của role.
      const cookies = state.cookies.map((c: any) =>
        c.name === 'access_token' && roles[role].accessToken ? { ...c, value: roles[role].accessToken } : c.name === 'refresh_token' && roles[role].refreshToken ? { ...c, value: roles[role].refreshToken } : c,
      );
      await context.clearCookies();
      await context.addCookies(cookies);
    }),
});

export { expect } from '@playwright/test';
