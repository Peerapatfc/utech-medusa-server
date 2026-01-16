import { PriceListListTable } from './components/price-list-list-table';
import { SingleColumnPage } from '../../../../components/layout/pages';

export const PriceListList = () => {
	return (
		<SingleColumnPage hasOutlet={false}>
			<PriceListListTable />
		</SingleColumnPage>
	);
};
