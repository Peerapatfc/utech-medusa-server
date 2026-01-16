import Payment2C2PBase from '../core/base';
import { ChannelCode } from '../types';

class Payment2C2PInstallmentProviderService extends Payment2C2PBase {
	static identifier = 'installment-plan';

	get paymentIntentOptions() {
		return {
			payment_method_types: ['installment-plan'],
			payment_channel: [ChannelCode.IPP],
		};
	}
}

export default Payment2C2PInstallmentProviderService;
