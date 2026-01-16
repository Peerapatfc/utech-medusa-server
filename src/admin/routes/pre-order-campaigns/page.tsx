import { defineRouteConfig } from '@medusajs/admin-sdk';
import { ListBullet } from '@medusajs/icons';
import PreOrderListPage from './list/page';

const PreOrderIndexPage = () => {
	return <PreOrderListPage />;
};

export const config = defineRouteConfig({
	label: 'Pre-Order Campaignes',
	icon: ListBullet,
});

export default PreOrderIndexPage;
