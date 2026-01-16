import { RouteFocusModal } from "../../../components/modals";
import { CreatePreOrderTemplateForm } from "./components/create-form";

export const PreOrderTemplateCreate = () => {
	return (
		<RouteFocusModal>
			<CreatePreOrderTemplateForm />
		</RouteFocusModal>
	);
};

export default PreOrderTemplateCreate;
