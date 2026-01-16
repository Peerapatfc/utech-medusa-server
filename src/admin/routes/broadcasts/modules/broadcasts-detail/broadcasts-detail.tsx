import { useParams } from 'react-router-dom';
import { SingleColumnPage } from '../../../../components/layout/pages';
import BackButton from '../../../../components/back-button';
import { BroadCastsGeneralSection } from './components/broadcasts-general-section';
import { useEffect, useState } from 'react';
import type { StoreNotification } from '@customTypes/store-notification';
import { getStoreNotificationById } from '../../../../hooks/api/store-notifications';

export const BroadCastsDetails = () => {
	const { id } = useParams();
	const [broadCast, setBroadCasts] = useState<StoreNotification>();

	useEffect(() => {
		const fetch = async () => {
			if (id) {
				const broadCast = await getStoreNotificationById(id);
				setBroadCasts(broadCast);
			}
		};
		fetch();
	}, [id]);

	if (!broadCast) {
		return null;
	}

	return (
		<>
			<BackButton
				path='/broadcasts'
				label='Back to Broad Cast Lists'
				className='my-4'
			/>
			<SingleColumnPage>
				<BroadCastsGeneralSection broadCast={broadCast} />
			</SingleColumnPage>
		</>
	);
};
