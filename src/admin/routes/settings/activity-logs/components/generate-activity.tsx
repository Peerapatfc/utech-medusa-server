import type { AdminLogResponse } from '@customTypes/admin';
import { Link } from 'react-router-dom';

const checkIsDeleteAction = (activity: AdminLogResponse) => {
	const { action, metadata } = activity;
	return !!metadata?.isDelete || action === 'deleted';
};

const getActivityDescription = (activity: AdminLogResponse) => {
	const { resource_type } = activity;
	switch (resource_type) {
		case 'product':
			return productActivity(activity);
		case 'product_variant':
			return productVariantActivity(activity);
		case 'payment':
			return paymentActivity(activity);
		case 'order':
			return orderActivity(activity);
		case 'fulfillment':
			return fulfillmentActivity(activity);
		case 'price':
			return pricingActivity(activity);
		case 'inventory_item':
			return inventoryActivity(activity);
		case 'promotion':
			return promotionActivity(activity);
		case 'campaign':
			return campaignActivity(activity);
		case 'flash_sale':
			return flashSaleActivity(activity);
	}
	return (
		<>
			{activity.action_name} {activity.resource_type} {activity.resource_id}
		</>
	);
};

const inventoryActivity = (activity: AdminLogResponse) => {
	const { action, description, resource_id } = activity;

	return (
		<>
			<span className='capitalize mr-2'>{action}</span>
			Inventory quantity for
			<Link to={`/inventory/${resource_id}`} className='ml-2'>
				<span className='font-medium text-teal-500'>{description}</span>
			</Link>
		</>
	);
};

const pricingActivity = (activity: AdminLogResponse) => {
	const { action, description, sub_description, metadata } = activity;
	const variantId = metadata?.variant_id as string;
	const productId = metadata?.product_id as string;

	return (
		<>
			<span className='capitalize'>{action} price </span>
			for
			<Link
				to={`/products/${productId}/variants/${variantId}`}
				className='ml-2 mr-2'
			>
				<span className='font-medium text-teal-500'>{sub_description}</span>
			</Link>
			from
			<Link to={`/products/${productId}`} className='ml-2'>
				<span className='font-medium text-teal-500'>{description}</span>
			</Link>
		</>
	);
};

const fulfillmentActivity = (activity: AdminLogResponse) => {
	const { action, resource_id } = activity;
	const order_no = activity.metadata?.order_no as string;
	let actionName = action;
	switch (action) {
		case 'created':
			actionName = 'Created Fulfillment for';
			break;
		case 'mark_as_delivered':
			actionName = 'Marked as delivered for';
			break;
		case 'mark_as_shipped':
			actionName = 'Marked as shipped for';
			break;
	}

	return (
		<>
			<span>{actionName}</span>
			<Link to={`/orders/${resource_id}`} className='ml-2'>
				<span className='font-medium text-teal-500'>Order #{order_no}</span>
			</Link>
		</>
	);
};

const orderActivity = (activity: AdminLogResponse) => {
	const { action, resource_id } = activity;
	const order_no = activity.metadata?.order_no as string;
	let actionName = action;
	switch (action) {
		case 'canceled':
			actionName = 'Canceled Order';
			break;
		case 'auto_cancel':
			actionName = 'Auto-Canceled Order';
			break;
	}

	return (
		<>
			<span className='capitalize'>{actionName}</span>
			<Link to={`/orders/${resource_id}`} className='ml-2'>
				<span className='font-medium text-red-500'>#{order_no}</span>
			</Link>
		</>
	);
};

const paymentActivity = (activity: AdminLogResponse) => {
	const { action, resource_id } = activity;
	const order_no = activity.metadata?.order_no as string;

	return (
		<>
			<span className='capitalize'>{action} payment </span>
			for
			<Link to={`/orders/${resource_id}`} className='ml-2'>
				<span className='font-medium text-teal-500'>Order #{order_no}</span>
			</Link>
		</>
	);
};

const productActivity = (activity: AdminLogResponse) => {
	const { action, resource_id, description } = activity;

	return (
		<>
			<span className='capitalize'>{action} product</span>
			<Link to={`/products/${resource_id}`} className='ml-4'>
				<span className='font-medium text-teal-500'>{description}</span>
			</Link>
		</>
	);
};

const productVariantActivity = (activity: AdminLogResponse) => {
	const { action, resource_id, description, sub_description, metadata } =
		activity;
	const variantId = metadata?.variant_id;
	return (
		<>
			<span className='capitalize'>{action} product variant</span>
			{action === 'updated' && (
				<>
					<Link
						to={`/products/${resource_id}/variants/${variantId}`}
						className='ml-3'
					>
						<span className='font-medium text-teal-500'>{description}</span>
					</Link>
					<span className='ml-3'>from</span>
					<Link to={`/products/${resource_id}`} className='ml-3'>
						<span className='font-medium text-teal-500'>{sub_description}</span>
					</Link>
				</>
			)}

			{action === 'deleted' && (
				<>
					<span className='font-medium text-red-500 ml-2'>{description}</span>
					<span className='ml-3'>from</span>
					<Link to={`/products/${resource_id}`} className='ml-3'>
						<span className='font-medium text-teal-500'>{sub_description}</span>
					</Link>
				</>
			)}

			{action === 'created' && (
				<>
					<span className='ml-2'>in</span>
					<Link to={`/products/${resource_id}`} className='ml-3'>
						<span className='font-medium text-teal-500'>{sub_description}</span>
					</Link>
				</>
			)}
		</>
	);
};

const promotionActivity = (activity: AdminLogResponse) => {
	const { action, resource_id, description } = activity;
	const isDelete = checkIsDeleteAction(activity);

	return (
		<>
			<span className='capitalize'>Event: {action} promotion</span>

			{!isDelete && (
				<Link to={`/promotions/${resource_id}`} className='ml-4'>
					<span className='font-medium text-teal-500'>{description}</span>
				</Link>
			)}
			{isDelete && (
				<span className='font-medium text-teal-500 ml-4'>{description}</span>
			)}
		</>
	);
};
const campaignActivity = (activity: AdminLogResponse) => {
	const { action, resource_id, description } = activity;
	const isDelete = checkIsDeleteAction(activity);

	return (
		<>
			<span className='capitalize'>Event: {action} campaign</span>

			{!isDelete && (
				<Link to={`/campaigns/${resource_id}`} className='ml-4'>
					<span className='font-medium text-teal-500'>{description}</span>
				</Link>
			)}
			{isDelete && (
				<span className='font-medium text-teal-500 ml-4'>{description}</span>
			)}
		</>
	);
};
const flashSaleActivity = (activity: AdminLogResponse) => {
	const { action, resource_id, description } = activity;
	const isDelete = checkIsDeleteAction(activity);

	return (
		<>
			<span className='capitalize'>Event: {action} flash sale</span>
			{!isDelete && (
				<Link to={`/flash-sale/${resource_id}`} className='ml-4'>
					<span className='font-medium text-teal-500'>{description}</span>
				</Link>
			)}
			{isDelete && (
				<span className='font-medium text-teal-500 ml-4'>{description}</span>
			)}
		</>
	);
};

export { getActivityDescription };
