import type { Dashboard } from '../../../../types/dashboard';

interface OrderRowProps {
	item: Dashboard['dashboard']['last_orders'][0];
	navigate: (path: string) => void;
}

const OrderRow = ({ item, navigate }: OrderRowProps) => {
	const handleClick = () => navigate(`/orders/${item.id}`);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleClick();
		}
	};

	return (
		<tr
			className='border-b last:border-b-0 border-neutral-500 text-[12px] cursor-pointer hover:bg-ui-bg-base-hover'
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			tabIndex={0}
		>
			<td className='px-2 pl-8 py-2 text-left'>{item.customer_name}</td>
			<td className='px-2 py-2 text-center'>{item.item_quantity}</td>
			<td className='px-2 pr-8 py-2 text-right'>{item.total}</td>
		</tr>
	);
};

export default OrderRow;
