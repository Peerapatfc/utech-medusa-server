import OrganizeProductsCollectionForm from '../../../../components/organize-products-collection-form';
import { useParams } from 'react-router-dom';
import { RouteFocusModal } from '../../../../components/modals/route-focus-modal';

const ProductCollectionsOrganize = () => {
	const { id: collectionId } = useParams();
	return (
		<RouteFocusModal>
			<OrganizeProductsCollectionForm collectionId={collectionId ?? ''} />
		</RouteFocusModal>
	);
};

export default ProductCollectionsOrganize;
