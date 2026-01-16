import { useParams } from 'react-router-dom';
import { RouteFocusModal } from '../../../../../components/route-modal';
import { useProduct } from '../../../../../hooks/api/products';
import { CreateProductVariantForm } from './components/create-product-variant-form';

export const ProductCreateVariant = () => {
	const { id } = useParams();

	const { product, isLoading, isError, error } = useProduct(id ?? '');

	if (isError) {
		throw error;
	}

	return (
		<RouteFocusModal>
			{!isLoading && product && <CreateProductVariantForm product={product} />}
		</RouteFocusModal>
	);
};

export default ProductCreateVariant;
