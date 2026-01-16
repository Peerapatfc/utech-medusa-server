import type { Dashboard } from '../../../../types/dashboard';

interface SearchTermRowProps {
	item: Dashboard['dashboard']['top_search_terms'][0];
}

const SearchTermRow = ({ item }: SearchTermRowProps) => {
	return (
		<tr
			key={item.id}
			className='border-b last:border-b-0 border-neutral-500 text-[12px]'
		>
			<td className='px-2 pl-8 py-2 text-left'>{item.search}</td>
			<td className='px-2 py-2 text-center'>{item.count}</td>
		</tr>
	);
};

export default SearchTermRow;
