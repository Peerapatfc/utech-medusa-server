import type { PaymentRestriction } from '@customTypes/payment-restriction';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
	AdminRuleAttributeOption,
	PaymentProviderDTO,
} from '@medusajs/framework/types';
import { Button, FocusModal, Input, toast } from '@medusajs/ui';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Divider } from '../../../components/common/divider';
import { Form } from '../../../components/common/form';
import { Combobox } from '../../../components/inputs/combobox';
import { usePromotionRuleAttributes } from '../../../hooks/api/promotions';
import { formatProvider } from '../../../lib/format-provider';
import { RulesFormField } from './common/edit-rules/components/rules-form-field';
import { RuleSchema } from './form-schema';

export const PaymentRestrictionSchema = z.object({
	name: z.string().min(1),
	payment_providers: z.string().array(),
	is_active: z.string().min(1),
	rules: RuleSchema,
});

const enableOptions = [
	{ value: '1', label: 'Active' },
	{ value: '0', label: 'Disabled' },
];

const _operators = [
	{
		id: 'eq',
		value: 'eq',
		label: 'Equals',
	},
	{
		id: 'gt',
		value: 'gt',
		label: 'Greater than',
	},
	{
		id: 'lt',
		value: 'lt',
		label: 'Less than',
	},
	{
		id: 'eq_gt',
		value: 'eq_gt',
		label: 'Equals or greater than',
	},
	{
		id: 'eq_lt',
		value: 'eq_lt',
		label: 'Equals or less than',
	},
];

const attrs1: AdminRuleAttributeOption[] = [
	{
		id: 'product.variant.id',
		value: 'product.variant.id',
		label: 'Product Variants',
		field_type: 'multiselect',
		operators: [
			{
				id: 'eq',
				value: 'eq',
				label: 'Equals',
			},
			{
				id: 'in',
				value: 'in',
				label: 'Contains Any',
			},
			{
				id: 'in_only',
				value: 'in_only',
				label: 'Contains Only These',
			},
			{
				id: 'ne',
				value: 'ne',
				label: 'Not Contains',
			},
		],
		required: false,
	},
	{
		id: 'cart.sub_total',
		value: 'cart.sub_total',
		label: 'Cart Sub Total',
		required: true,
		field_type: 'number',
		operators: _operators,
	},
	{
		id: 'cart.total',
		value: 'cart.total',
		label: 'Cart Total',
		required: true,
		field_type: 'number',
		operators: _operators,
	},
	{
		id: 'cart.pickup_option',
		value: 'cart.metadata.pickup_option.slug',
		label: 'Pickup Option (For Pre-order)',
		field_type: 'multiselect',
		operators: [
			{
				id: 'eq',
				value: 'eq',
				label: 'Equals',
			},
			{
				id: 'in',
				value: 'in',
				label: 'In',
			},
			{
				id: 'ne',
				value: 'ne',
				label: 'Not In',
			},
		],
		required: false,
	},
];

const PaymentRestrictionFormModal = ({
	openModal,
	setOpenModal,
	id,
	paymentProviders,
	handleCloseModal,
}: {
	openModal: boolean;
	setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
	id?: string;
	paymentProviders: PaymentProviderDTO[];
	handleCloseModal: () => void;
}) => {
	const { t } = useTranslation();
	const [payment_restriction, setPaymentRestriction] =
		useState<PaymentRestriction | null>(null);
	const form = useForm<z.infer<typeof PaymentRestrictionSchema>>({
		resolver: zodResolver(PaymentRestrictionSchema),
	});
	const { handleSubmit, setValue } = form;
	const onSubmit = handleSubmit(
		(data: z.infer<typeof PaymentRestrictionSchema>) => {
			data.is_active = data.rules.length > 0 ? data.is_active : '0';
			if (id) {
				fetch(`/admin/payment-restrictions/${id}`, {
					credentials: 'include',
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				})
					.then((res) => res.json())
					.then(() => {
						toast.success(t('general.success'), {
							description: 'Payment Restrictions were successfully created.',
						});
					})
					.catch((error) => {
						console.error('Error:', error);
						toast.error(t('general.error'), {
							description: error.message,
						});
					});
			} else {
				fetch('/admin/payment-restrictions', {
					credentials: 'include',
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				})
					.then((res) => res.json())
					.then(() => {
						toast.success(t('general.success'), {
							description: 'Payment Restrictions were successfully created.',
						});
					})
					.catch((error) => {
						console.error('Error:', error);
						toast.error(t('general.error'), {
							description: error.message,
						});
					});
			}
			setTimeout(() => {
				setOpenModal(false);
			}, 1000);
		},
	);

	useEffect(() => {
		setValue('name', '');
		setValue('payment_providers', []);
		setValue('is_active', '');
		setValue('rules', []);
		const fetchData = async () => {
			if (id) {
				await fetch(`/admin/payment-restrictions/${id}`, {
					credentials: 'include',
					method: 'GET',
				})
					.then((response) => response.json())
					.then(
						({
							payment_restriction: restriction,
						}: { payment_restriction: PaymentRestriction }) => {
							setPaymentRestriction(restriction);
							setValue('name', restriction.name);
							setValue('payment_providers', restriction.payment_providers);
							setValue('is_active', restriction.is_active ? '1' : '0');
							const rules: z.infer<typeof RuleSchema> = [];
							restriction.payment_restriction_rules?.map((rule) => {
								const rule_values = rule.payment_restriction_rule_values ?? [];
								if (rule.operator === 'in' || rule.operator === 'ne') {
									const values: string[] = [];
									rule_values.map((value) => {
										values.push(value.value);
									});
									rules.push({
										attribute: rule.attribute,
										operator: rule.operator,
										values,
									});
								} else {
									const values =
										rule_values.length > 0 ? rule_values[0].value : '';
									rules.push({
										attribute: rule.attribute,
										operator: rule.operator,
										values,
									});
								}
							});
							setValue('rules', rules);
						},
					)
					.catch((error) => {
						toast.error(t('general.error'), {
							description: error.message,
						});
					});
			}
		};
		fetchData();
	}, [id, setValue, t]);

	let attributes: AdminRuleAttributeOption[] = [];
	const { attributes: attrs2 = [] } = usePromotionRuleAttributes(
		'target-rules',
		'standard',
	);

	attributes = attrs2.concat(attrs1);

	return (
		<FocusModal open={openModal} onOpenChange={handleCloseModal}>
			<FocusModal.Content className='overflow-y-auto'>
				<FocusModal.Header>
					<span className='order-first'>
						{payment_restriction ? 'Edit' : 'Create'} Payment Restriction{' '}
						{payment_restriction?.name ?? ''}
					</span>
				</FocusModal.Header>
				<FocusModal.Body className='py-2 px-4 w-[50%] mx-auto mt-12 mb-12'>
					<FormProvider {...form}>
						<form onSubmit={onSubmit}>
							<div className='grid grid-cols-2 gap-x-3 mb-3'>
								<Form.Field
									control={form.control}
									name='name'
									render={({ field }) => {
										return (
											<Form.Item className='w-full'>
												<Form.Label className='flex items-center font-bold gap-x-1'>
													Name
												</Form.Label>
												<Input
													{...field}
													type='text'
													value={field.value}
													onChange={(e) => field.onChange(e.target.value)}
												/>
												<Form.ErrorMessage />
											</Form.Item>
										);
									}}
								/>
							</div>
							<div className='grid grid-cols-2 gap-x-3 mb-3'>
								<Form.Field
									control={form.control}
									name='payment_providers'
									render={({ field }) => {
										return (
											<Form.Item className='w-full'>
												<Form.Label className='flex items-center font-bold gap-x-1'>
													Payment Providers
												</Form.Label>
												<Form.Control>
													<Combobox
														{...field}
														value={field.value ?? []}
														placeholder='Select Values'
														options={paymentProviders.map((pp) => ({
															label: formatProvider(pp.id),
															value: pp.id,
														}))}
														onChange={field.onChange}
													/>
												</Form.Control>
												<Form.ErrorMessage />
											</Form.Item>
										);
									}}
								/>
							</div>
							<div className='grid grid-cols-2 gap-x-3 mb-3'>
								<Form.Field
									control={form.control}
									name='is_active'
									render={({ field }) => {
										return (
											<Form.Item className='w-full'>
												<Form.Label className='flex items-center font-bold gap-x-1'>
													Status
												</Form.Label>
												<Form.Control>
													<Combobox
														options={enableOptions.map((option) => ({
															label: option.label,
															value: option.value,
														}))}
														{...field}
													/>
												</Form.Control>
												<Form.ErrorMessage />
											</Form.Item>
										);
									}}
								/>
							</div>
							<div className='grid grid-1 mb-3'>
								<Form.Item className='w-full'>
									<Divider className='my-3' />
									<RulesFormField
										ruleType={'rules'}
										attributes={attributes}
										form={form}
									/>
								</Form.Item>
							</div>
							<div className='flex justify-end mt-3'>
								<Button
									type='button'
									variant='secondary'
									className='h-fit'
									onClick={() => handleCloseModal()}
								>
									Cancel
								</Button>
								<Button type='submit' variant='primary' className='h-fit ml-3'>
									Save
								</Button>
							</div>
						</form>
					</FormProvider>
				</FocusModal.Body>
			</FocusModal.Content>
		</FocusModal>
	);
};

export default PaymentRestrictionFormModal;
