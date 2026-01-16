import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, Heading } from '@medusajs/ui';
import { Button, toast } from '@medusajs/ui';
import { PencilSquare } from '@medusajs/icons';
import type {
	AdminProduct,
	DetailWidgetProps,
} from '@medusajs/framework/types';

export function ButtonSecondary({ product }: { product: AdminProduct }) {
	const handleClick = () => {
		goToStrapi(product.id);
	};

	return (
		<Button
			type='button'
			onClick={handleClick}
			variant='secondary'
			className='w-1/5'
		>
			<PencilSquare className='mr-0' />
			Edit
		</Button>
	);
}

const EditProductContentWidget = ({
	data,
}: DetailWidgetProps<AdminProduct>) => {
	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading level='h2'>Edit Product content</Heading>
				<ButtonSecondary product={data} />
			</div>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'product.details.side.after',
});

export default EditProductContentWidget;

const getStrapiLink = async (id: string) => {
	return fetch(
		`/admin/strapi/generate-link?collection=product&collection_id=${id}`,
		{
			credentials: 'include',
		},
	)
		.then((res) => res.json())
		.then((response) => {
			return response;
		})
		.catch((error) => {
			console.error(`Error: ${error}`);
			return null;
		});
};

const goToStrapi = async (id: string) => {
	const { link, message } = await getStrapiLink(id);

	if (link) {
		window.open(link, '_blank');
	} else {
		toast.warning('Warning', {
			description: message,
		});
	}
};
