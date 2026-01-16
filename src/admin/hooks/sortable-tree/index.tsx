import { toast } from '@medusajs/ui';
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useRef,
	useState,
} from 'react';

type UseSortableTree<T> = {
	updateRank: (rank: number, item: T) => Promise<void>;
	setItems: Dispatch<SetStateAction<T[]>>;
	successMessage?: string;
	errorMessage?: string;
};

export const useSortableTree = <T,>({
	updateRank,
	setItems,
	successMessage,
	errorMessage,
}: UseSortableTree<T>) => {
	const [isLoading, setIsLoading] = useState(false);

	const debounceTimer = useRef<NodeJS.Timeout | null>(null);

	const updateRankItems = useCallback(
		async (items: T[]) => {
			try {
				await Promise.all(items.map((item, index) => updateRank(index, item)));

				if (successMessage) {
					toast.success(successMessage, {
						position: 'top-center',
					});
				}
			} catch (error) {
				if (errorMessage) {
					toast.error(errorMessage, {
						position: 'top-center',
					});
				}
				console.error('Error updating collections:', error);
			} finally {
				setIsLoading(false);
			}
		},
		[updateRank, successMessage, errorMessage],
	);

	const handleRankChange = useCallback(
		(items: T[]) => {
			setIsLoading(true);

			if (debounceTimer.current) {
				clearTimeout(debounceTimer.current);
			}

			debounceTimer.current = setTimeout(() => {
				console.log('Update success');
				updateRankItems(items); // Use updateRankItems to handle the update
			}, 1000);

			setItems(items); // Update local state immediately
		},
		[updateRankItems, setItems],
	);

	return { handleRankChange, isLoading };
};
