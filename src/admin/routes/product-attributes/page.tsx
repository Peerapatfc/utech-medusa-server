import { defineRouteConfig } from '@medusajs/admin-sdk';
import ProductAttributePage from './product-attribute-list/page';

const ProductAttributesPage = () => {
	return <ProductAttributePage />;
};

export default ProductAttributesPage;

export const config = defineRouteConfig({
	label: 'Attributes',
	nested: '/products',
});
