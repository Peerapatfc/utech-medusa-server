import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, Heading, Button, Text } from '@medusajs/ui';
import { Link } from 'react-router-dom';

const EditRanking = () => {
	return (
		<Container>
			<Heading>Arrange on Homepage</Heading>
			<Text className='text-ui-fg-subtle' size='small'>
				Only the top 10 collections will be displayed.
			</Text>
			<div className='mt-2'>
				<Button size='small' variant='secondary' asChild>
					<Link to='collections-organize'>Edit Ranking</Link>
				</Button>
			</div>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'product_collection.list.before',
});

export default EditRanking;
