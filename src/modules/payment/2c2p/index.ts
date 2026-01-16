import type { ModuleProviderExports } from '@medusajs/framework/types';
import {
	Payment2C2PQrProviderService,
	Payment2C2PCreditProviderService,
	Payment2C2PWalletProviderService,
	Payment2C2PInternetBankingProviderService,
	Payment2C2PBillingProviderService,
	Payment2C2PInstallmentProviderService,
} from './services';

const services = [
	Payment2C2PQrProviderService,
	Payment2C2PCreditProviderService,
	Payment2C2PWalletProviderService,
	Payment2C2PInternetBankingProviderService,
	Payment2C2PBillingProviderService,
	Payment2C2PInstallmentProviderService,
];

const providerExport: ModuleProviderExports = {
	// @ts-ignore
	services,
};

export default providerExport;
