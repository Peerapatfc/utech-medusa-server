import { defineRouteConfig } from '@medusajs/admin-sdk';
import { useParams } from 'react-router-dom';
import { useProductAttributeCategory } from '../../../../hooks/api/product-attribute-categories';
import EditProductAttributeCategoryForm from './components/edit-category-form';

export const ProductAttributeCategoryEdit = () => {
	const { id } = useParams();
	const { isLoading, isError, error, product_attribute_category } =
		useProductAttributeCategory(id || '');

	if (isError) {
		throw error;
	}

	if (isLoading || !product_attribute_category) {
		return null;
	}

	return (
		<EditProductAttributeCategoryForm category={product_attribute_category} />
	);
};

export default ProductAttributeCategoryEdit;

export const config = defineRouteConfig({});
