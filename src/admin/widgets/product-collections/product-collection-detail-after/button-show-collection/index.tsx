import { useState, useEffect, useCallback } from 'react';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, Heading, Label, Switch, StatusBadge } from '@medusajs/ui';
import { useParams } from 'react-router-dom';
import type {
	CollectionMetadataT,
	CollectionT,
} from '../../../../../types/collections';

const ShowCollectionWidget = () => {
	const { id } = useParams();
	const [isDisplayed, setIsDisplayed] = useState<boolean>(false);

	const fetchCollection = useCallback(async () => {
		try {
			const response = await fetch(`/admin/collections/${id}`);

			if (!response.ok) {
				throw new Error('Failed to update metadata');
			}

			const data = (await response.json()) as { collection: CollectionT };
			const metadata = data.collection.metadata;

			setIsDisplayed(metadata?.is_store_visible ?? false);

			console.log('Metadata updated successfully');
		} catch (error) {
			console.error('Error updating metadata:', error);
		}
	}, []);

	const handleSwitchChange = useCallback(async (checked: boolean) => {
		try {
			setIsDisplayed(checked);

			const metadata: CollectionMetadataT = {
				is_store_visible: checked,
			};

			const response = await fetch(`/admin/collections/${id}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					metadata,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to update metadata');
			}

			console.log('Metadata updated successfully');
		} catch (error) {
			console.error('Error updating metadata:', error);
		}
	}, []);

	useEffect(() => {
		fetchCollection();
	}, []);

	return (
		<Container>
			<div className='flex gap-x-6'>
				<Heading>Show Collection on home page</Heading>
				<StatusBadge color={isDisplayed ? 'green' : 'grey'}>
					{isDisplayed ? 'Active' : 'Inactive'}
				</StatusBadge>
			</div>

			<div className='flex items-center mt-3 gap-x-2'>
				<Switch
					id='manage-inventory'
					checked={isDisplayed ?? false}
					onCheckedChange={handleSwitchChange}
				/>
				<Label>Show on the store</Label>
			</div>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'product_collection.details.after',
});

export default ShowCollectionWidget;
