import { Container, Heading, Button } from '@medusajs/ui';
import { Link } from 'react-router-dom';
import type { HttpTypes } from '@medusajs/types';

type PriceListEditRankProductSectionProps = {
	priceList: HttpTypes.AdminPriceList;
};

const PriceListEditRankProductSection = ({
	priceList,
}: PriceListEditRankProductSectionProps) => {
	return (
		<div>
			<Container>
				<Heading>Organize Product Display</Heading>
				<div className='mt-2'>
					<Button size='small' variant='secondary' asChild>
						<Link
							to={`/flash-sale/${priceList.id}/organize-product-flash-sale`}
						>
							Edit Product Ranking
						</Link>
					</Button>
				</div>
			</Container>
		</div>
	);
};

export default PriceListEditRankProductSection;
