import { useParams } from "react-router-dom";
import { RouteFocusModal } from "../../../../components/route-modal";
import { AssignProductsForm } from "./components/assign-products-form";

const RelatedProductsPage = () => {
	const { id } = useParams();

	return (
		<RouteFocusModal>
			<AssignProductsForm productId={id} />
		</RouteFocusModal>
	);
};

export default RelatedProductsPage;
