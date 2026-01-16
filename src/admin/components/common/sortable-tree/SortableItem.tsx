import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSix } from '@medusajs/icons';

type SortableItemPropT = {
	id: string;
	name: string;
	thumbnail?: string;
};

const SortableItem = ({ id, name, thumbnail }: SortableItemPropT) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		padding: '10px',
		margin: '10px 0',
		borderRadius: '5px',
		border: '1px solid #ccc',
		cursor: 'grab',
	};
	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className='flex items-center '
		>
			<DotsSix />
			{thumbnail ? (
				<div className='w-[50px]'>
					<img src={thumbnail} alt={name} />
				</div>
			) : null}
			<span className='ml-3'>{name}</span>
		</div>
	);
};

export default SortableItem;
