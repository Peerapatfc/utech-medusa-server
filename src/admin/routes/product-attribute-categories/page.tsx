import { defineRouteConfig } from '@medusajs/admin-sdk';
import ProductAttributeCategoryList from './components/product-attribute-category-list';

const ProductAttributeCategoriesPage = () => {
	return <ProductAttributeCategoryList />;
};

export default ProductAttributeCategoriesPage;

export const config = defineRouteConfig({
	label: 'Attribute Categories',
	nested: '/products',
});
