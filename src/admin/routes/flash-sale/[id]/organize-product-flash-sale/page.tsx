import { useParams } from 'react-router-dom';
import { RouteFocusModal } from '../../../../components/modals/route-focus-modal';
import OrganizeFlashSaleForm from '../../../../components/organize-product-flash-sale-form';

const ProductFlashSaleOrganize = () => {
	const { id: priceListId } = useParams();

	return (
		<RouteFocusModal>
			<OrganizeFlashSaleForm priceListId={priceListId as string} />
		</RouteFocusModal>
	);
};

export default ProductFlashSaleOrganize;
