import { useState, useEffect, useCallback } from 'react';
import { RouteFocusModal } from '../modals/route-focus-modal';
import type {
	CollectionT,
	CollectionMetadataT,
} from '../../../types/collections';
import { Spinner } from '@medusajs/icons';
import SortableTree from '../common/sortable-tree';
import { useSortableTree } from '../../hooks/sortable-tree';

const OrganizeCollectionForm = () => {
	const [collections, setCollections] = useState<CollectionT[]>([]);

	const limitCollections = 200;

	// Fetch collections with sorting
	const fetchCollections = useCallback(async (limit = limitCollections) => {
		try {
			// setIsLoading(true);
			const response = await fetch(`/admin/collections?limit=${limit}`, {
				method: 'GET',
			});

			if (!response.ok) {
				throw new Error('Failed to fetch collections');
			}

			const data: { collections: CollectionT[] } = await response.json();

			const sortedCollections = (data.collections || []).sort((a, b) => {
				const rankA = a.metadata?.rank ?? Number.MAX_SAFE_INTEGER;
				const rankB = b.metadata?.rank ?? Number.MAX_SAFE_INTEGER;
				return rankA - rankB;
			});

			setCollections(sortedCollections);
		} catch (error) {
			console.error('Error fetching collections:', error);
		} finally {
			// setIsLoading(false);
		}
	}, []);

	// Update collection rank
	const updateRank = useCallback(
		async (rank: number, collection: CollectionT) => {
			const response = await fetch(`/admin/collections/${collection.id}`, {
				credentials: 'include',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},

				body: JSON.stringify({
					metadata: { rank },
				}),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to update rank for collection ${collection.id}`,
				);
			}
		},
		[],
	);

	const { handleRankChange, isLoading } = useSortableTree({
		updateRank,
		setItems: setCollections,
		successMessage: 'Update ranking collections success',
		errorMessage: 'Update ranking collections failed',
	});

	useEffect(() => {
		fetchCollections();
	}, [fetchCollections]);

	return (
		<div className='flex h-full flex-col overflow-hidden'>
			<RouteFocusModal.Header>
				{isLoading ? (
					<Spinner className='animate-spin' />
				) : (
					<h1>Organize Collections</h1>
				)}
			</RouteFocusModal.Header>

			<RouteFocusModal.Body className='bg-ui-bg-subtle flex flex-1 flex-col overflow-y-auto'>
				<RouteFocusModal.Title className='sr-only' />
				<div className='p-3 '>
					<SortableTree items={collections} onChange={handleRankChange} />
				</div>
			</RouteFocusModal.Body>
		</div>
	);
};

export default OrganizeCollectionForm;
