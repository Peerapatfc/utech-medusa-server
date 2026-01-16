import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, Heading, Button } from '@medusajs/ui';
import { Link } from 'react-router-dom';

const EditRankingProducts = () => {
	return (
		<Container>
			<Heading>Organize Product Display Order</Heading>
			<div className='mt-2'>
				<Button size='small' variant='secondary' asChild>
					<Link to='organize-product-collections'>Edit Product Ranking</Link>
				</Button>
			</div>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'product_collection.details.after',
});

export default EditRankingProducts;
