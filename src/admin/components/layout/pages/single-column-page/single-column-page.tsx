import { Outlet } from 'react-router-dom';
import { JsonViewSection } from '../../../common/json-view-section';
import { MetadataSection } from '../../../common/metadata-section';
import type { PageProps } from '../types';

export const SingleColumnPage = <TData,>({
	children,
	data,
	hasOutlet = true,
	showJSON,
	showMetadata,
}: PageProps<TData>) => {
	if (showJSON && !data) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'`showJSON` is true but no data is provided. To display JSON, provide data prop.',
			);
		}

		showJSON = false;
	}

	if (showMetadata && !data) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(
				'`showMetadata` is true but no data is provided. To display metadata, provide data prop.',
			);
		}

		showMetadata = false;
	}

	return (
		<div className='flex flex-col gap-y-3' data-template='custom'>
			{children}
			{showMetadata && <MetadataSection data={data!} />}
			{showJSON && <JsonViewSection data={data!} />}
			{hasOutlet && <Outlet />}
		</div>
	);
};
