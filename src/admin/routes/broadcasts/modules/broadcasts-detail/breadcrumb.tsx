import type { UIMatch } from 'react-router-dom';
import type { StoreNotification } from '@customTypes/store-notification';
import { useEffect, useState } from 'react';
import { getStoreNotificationById } from '../../../../hooks/api/store-notifications';

type BroadCastsDetailBreadcrumbProps = UIMatch<StoreNotification>;

export const BroadCastsDetailBreadcrumb = (
	props: BroadCastsDetailBreadcrumbProps,
) => {
	const { id } = props.params || {};
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

	return <span>{broadCast.subject_line}</span>;
};
