import { RouteFocusModal } from '../../../components/modals';
import { CreateProductAttributeCategoryForm } from './components/create-form';

export const ProductAttributeCategoryCreate = () => {
	return (
		<RouteFocusModal>
			<CreateProductAttributeCategoryForm />
		</RouteFocusModal>
	);
};

export default ProductAttributeCategoryCreate;
