import { defineRouteConfig } from '@medusajs/admin-sdk';
import { ProductList } from './modules/product-list';

const ProductsUpdatePage = () => {
	return <ProductList />;
};

export default ProductsUpdatePage;

export const config = defineRouteConfig({
	label: 'Bulk Update',
	nested: '/products',
});
