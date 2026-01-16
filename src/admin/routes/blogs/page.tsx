import { defineRouteConfig } from '@medusajs/admin-sdk';
import { ChartPie, Newspaper } from '@medusajs/icons';
import { Button, Container } from '@medusajs/ui';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdvancedSettingButton from '../../components/advanced-setting-button';

type Item = {
	id: string;
	title: string;
	sub_title: string;
	handleUrl: string;
	icon: JSX.Element;
};

const BlogsPage = () => {
	const [isLoaded, setIsLoaded] = useState<boolean>(false);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const items: Item[] = [
		{
			id: 'strapi-blogs',
			title: 'Manage Blogs',
			sub_title: 'Create and edit blog content via Strapi CMS',
			handleUrl: '',
			icon: <Newspaper />,
		},
		{
			id: 'blog-performance-report',
			title: 'Performance Report',
			sub_title: 'Export blog performance data with analytics',
			handleUrl: '/blogs/export',
			icon: <ChartPie />,
		},
	];

	const getStrapiLink = useCallback(async () => {
		const collection = 'blog';
		try {
			const res = await fetch(
				`/admin/strapi/generate-link?collection=${collection}`,
				{
					credentials: 'include',
				},
			);
			const { link } = await res.json();

			return link;
		} catch (error) {
			console.error(`Error: ${error}`);
			return null;
		}
	}, []);

	const goToStrapi = useCallback(async () => {
		if (!isLoaded) {
			const link = await getStrapiLink();
			setIsLoaded(true);
			if (link) {
				window.open(link, '_blank');
			}
		}
	}, [isLoaded, getStrapiLink]);

	useEffect(() => {
		const is_gone = searchParams.get('is_gone');
		if (!is_gone) {
			navigate('/blogs?is_gone=true');
		} else if (searchParams.get('openStrapi') === 'true') {
			goToStrapi();
		}
	}, [searchParams, navigate, goToStrapi]);

	const handleGenerateButton = (item: Item) => {
		if (item.id === 'strapi-blogs') {
			return (
				<Button
					variant='primary'
					onClick={() => {
						setIsLoaded(false);
						goToStrapi();
					}}
				>
					Open Strapi
				</Button>
			);
		}
		if (item.id === 'blog-performance-report') {
			return (
				<Button variant='primary' onClick={() => navigate('/blogs/export')}>
					Preview & Export
				</Button>
			);
		}
		return undefined;
	};

	return (
		<Container>
			<div className='flex items-center justify-between'>
				<div>
					<h1 style={{ fontWeight: '700', fontSize: '20px' }}>Blogs</h1>
					<p className='mt-4 mb-6'>
						Manage blog content and performance analytics
					</p>
				</div>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{items.map((item) => (
					<AdvancedSettingButton
						key={item.id}
						title={item.title}
						sub_title={item.sub_title}
						handleUrl={item.handleUrl}
						icon={item.icon}
						button={handleGenerateButton(item)}
					/>
				))}
			</div>
		</Container>
	);
};

export const config = defineRouteConfig({
	label: 'Blogs',
	icon: Newspaper,
});

export default BlogsPage;
