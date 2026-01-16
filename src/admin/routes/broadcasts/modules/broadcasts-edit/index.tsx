import { RouteFocusModal } from '../../../../components/modals';
import { BroadCastsEditForm } from './components/broadcasts-edit-form';

export const BroadCastsEdit = () => {
	return (
		<RouteFocusModal prev='../..'>
			<BroadCastsEditForm />
		</RouteFocusModal>
	);
};
