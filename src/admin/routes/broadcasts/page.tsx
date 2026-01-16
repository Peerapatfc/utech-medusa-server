import { defineRouteConfig } from '@medusajs/admin-sdk';
import { BroadCastsList } from './modules/broadcasts-list';
import BroadcastIcon from '../../components/fundamentals/icons/broadcast-icon';

const BroadcastPage = () => {
	return <BroadCastsList />;
};

export const config = defineRouteConfig({
	label: 'Broadcasts',
	icon: BroadcastIcon,
});
export default BroadcastPage;
