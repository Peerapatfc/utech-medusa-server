import type { Dashboard } from '../../../../types/dashboard';

interface ProductRowProps {
	item: Dashboard['dashboard']['best_sellers'][0];
	navigate: (path: string) => void;
}

const ProductRow = ({ item, navigate }: ProductRowProps) => {
	const handleClick = () => navigate(`/products/${item.product_id}`);

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
			<td
				className='px-2 pl-8 py-2 text-left line-clamp-1 h-7'
				title={item.product_title}
			>
				{item.product_title}
			</td>
			<td className='px-2 py-2 text-center'>{item.quantity}</td>
		</tr>
	);
};

export default ProductRow;
