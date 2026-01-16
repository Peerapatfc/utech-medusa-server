export const getPaymentName = (providerId: string) => {
	switch (providerId) {
		case 'pp_credit-card_2c2p':
			return 'บัตรเครดิต/เดบิต';
		case 'pp_qr-payment_2c2p':
			return 'QR PromptPay';
		case 'pp_e-wallet_2c2p':
			return 'e-Wallet';
		case 'pp_internet-banking_2c2p':
			return 'Internet Banking';
		case 'pp_billing_2c2p':
			return 'Billing';
		case 'pp_installment-plan_2c2p':
			return 'Installment Plan';
		default:
			return 'Default';
	}
};
