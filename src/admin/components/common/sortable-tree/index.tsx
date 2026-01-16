import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import SortableItem from '../sortable-tree/SortableItem';

interface SortableTreeProps<T> {
	items: T[];
	onChange: (updatedItems: T[]) => void;
	idKey?: keyof T;
	idTitle?: keyof T;
	idThumbnail?: keyof T;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const SortableTree = <T extends Record<string, any>>({
	items,
	onChange,
	idKey = 'id',
	idTitle = 'title',
	idThumbnail = 'thumbnail',
}: SortableTreeProps<T>) => {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor),
	);

	const handleDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;

		const oldIndex = items.findIndex((item) => item[idKey] === active.id);
		const newIndex = items.findIndex((item) => item[idKey] === over.id);

		const updatedItems = arrayMove(items, oldIndex, newIndex);
		onChange(updatedItems);
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={items.map((item) => item[idKey])}
				strategy={verticalListSortingStrategy}
			>
				{items.map((item) => (
					<SortableItem
						key={item[idKey]}
						id={item[idKey]}
						name={item[idTitle]}
						thumbnail={item[idThumbnail] || ''}
					/>
				))}
			</SortableContext>
		</DndContext>
	);
};

export default SortableTree;
