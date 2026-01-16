import { getPaymentName } from '../payment-method';

describe('getPaymentName', () => {
	it('should return the correct name for pp_credit-card_2c2p', () => {
		const result = getPaymentName('pp_credit-card_2c2p');
		expect(result).toBe('บัตรเครดิต/เดบิต');
	});

	it('should return the correct name for pp_qr-payment_2c2p', () => {
		const result = getPaymentName('pp_qr-payment_2c2p');
		expect(result).toBe('QR PromptPay');
	});

	it('should return the correct name for pp_e-wallet_2c2p', () => {
		const result = getPaymentName('pp_e-wallet_2c2p');
		expect(result).toBe('e-Wallet');
	});

	it('should return the correct name for pp_internet-banking_2c2p', () => {
		const result = getPaymentName('pp_internet-banking_2c2p');
		expect(result).toBe('Internet Banking');
	});

	it('should return the correct name for pp_billing_2c2p', () => {
		const result = getPaymentName('pp_billing_2c2p');
		expect(result).toBe('Billing');
	});

	it('should return the correct name for pp_installment-plan_2c2p', () => {
		const result = getPaymentName('pp_installment-plan_2c2p');
		expect(result).toBe('Installment Plan');
	});

	it('should return the default name for an unknown providerId', () => {
		const result = getPaymentName('unknown_provider');
		expect(result).toBe('Default');
	});
});
