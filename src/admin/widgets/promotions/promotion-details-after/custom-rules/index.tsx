import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { useEffect, useState } from 'react';
import { PencilSquare } from '@medusajs/icons';
import { Button, Heading, toast } from '@medusajs/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActionMenu } from '../../../../components/common/action-menu';
import { Form } from '../../../../components/common/form';
import { RulesFormField } from '../../../../routes/advanced-setting/payment-restriction/common/edit-rules/components/rules-form-field';
import type {
	AdminPromotion,
	AdminRuleAttributeOption,
} from '@medusajs/framework/types';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { PromotionDetail } from '@customTypes/promotion';

export const CustomRuleSchema = z.object({
	rules: z.array(
		z.object({
			id: z.string().optional(),
			attribute: z.string().min(1, { message: 'Required field' }),
			operator: z.string().min(1, { message: 'Required field' }),
			values: z.union([
				z.number().min(1, { message: 'Required field' }),
				z.string().min(1, { message: 'Required field' }),
				z.array(z.string()).min(1, { message: 'Required field' }),
			]),
			required: z.boolean().optional(),
			disguised: z.boolean().optional(),
			field_type: z.string().optional(),
		}),
	),
});

const operators = [
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
		id: 'gte',
		value: 'gte',
		label: 'Greater than or Equals',
	},
	{
		id: 'lte',
		value: 'lte',
		label: 'Less than or Equals',
	},
];

const attributes: AdminRuleAttributeOption[] = [
	{
		id: 'subtotal',
		value: 'subtotal',
		label: 'Cart Sub Total',
		required: true,
		field_type: 'number',
		operators: operators,
	},
];

interface CustomAdminPromotion extends AdminPromotion {
	promotion_detail: PromotionDetail;
}

const PromotionSubtotalWidget = () => {
	const { t } = useTranslation();
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isView, setIsView] = useState<boolean>(true);
	const form = useForm<z.infer<typeof CustomRuleSchema>>({
		resolver: zodResolver(CustomRuleSchema),
	});

	const cancelEdit = () => {
		setIsView(true);
	};
	const { handleSubmit, setValue } = form;

	const onSubmit = handleSubmit((data: z.infer<typeof CustomRuleSchema>) => {
		setIsLoading(true);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const custom_rules: Record<string, any> = {};
		data.rules.map((rule) => {
			const value: Record<string, number> = {};
			value[rule.operator] = rule.values as number;
			custom_rules[rule.attribute] = value;
		});
		if (id) {
			fetch(`/admin/custom/promotions/${id}/detail`, {
				credentials: 'include',
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ custom_rules, is_custom_rule: true }),
			})
				.then((res) => res.json())
				.then((res) => {
					if (res.success) {
						toast.success(t('general.success'), {
							description: 'Promotion Custom Rule were successfully updated.',
						});
						cancelEdit();
					} else {
						console.error('Error:', res);
						toast.error(t('general.error'), {
							description: res.message,
						});
					}
				})
				.catch((error) => {
					console.error('Error:', error);
					toast.error(t('general.error'), {
						description: error.message,
					});
				});
		}
		setIsLoading(false);
	});

	useEffect(() => {
		const fetchData = async () => {
			if (id) {
				await fetch(`/admin/custom/promotions/${id}/detail`, {
					credentials: 'include',
					method: 'GET',
				})
					.then((response) => response.json())
					.then(({ promotion }: { promotion: CustomAdminPromotion }) => {
						if (promotion.promotion_detail.custom_rules) {
							const rules: z.infer<typeof CustomRuleSchema> = {
								rules: [],
							};
							const custom_rules = promotion.promotion_detail.custom_rules;
							const subtotal = custom_rules.subtotal;
							if (subtotal) {
								const operator = subtotal
									? (Object.keys(subtotal).map((operator) => operator)[0] ?? '')
									: '';
								const values = subtotal
									? (subtotal[operator as 'lt' | 'gt' | 'gte' | 'lte'] ?? 0)
									: 0;
								rules.rules.push({
									id: 'subtotal',
									attribute: 'subtotal',
									operator: operator,
									values: values,
								});
								setValue('rules', rules.rules);
							}
						}
					})
					.catch((error) => {
						toast.error(t('general.error'), {
							description: error.message,
						});
					});
			}
		};
		fetchData();
	}, [id, setValue, t]);
	return (
		<div className='shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0'>
			<FormProvider {...form}>
				<form onSubmit={onSubmit} encType='text/plain'>
					<div className='flex items-center justify-between px-6 py-4'>
						<div className='flex flex-col'>
							<Heading level='h1'>
								What custom rules will the promotion be applied to?
							</Heading>
						</div>
						{!isView ? (
							<div className='flex items-center gap-2'>
								<Button
									variant='primary'
									size='small'
									type='submit'
									isLoading={isLoading}
								>
									Save
								</Button>
								<Button
									variant='secondary'
									size='small'
									type='button'
									onClick={() => cancelEdit()}
								>
									Cancel
								</Button>
							</div>
						) : (
							<ActionMenu
								groups={[
									{
										actions: [
											{
												label: 'Edit',
												onClick: () => setIsView(false),
												icon: <PencilSquare />,
											},
										],
									},
								]}
							/>
						)}
					</div>

					<div className='flex flex-col items-center justify-center text-ui-fg-subtle px-6'>
						<Form.Item className='w-full mb-6'>
							<RulesFormField
								form={form}
								ruleType={'rules'}
								attributes={attributes}
								isView={isView}
							/>
						</Form.Item>
					</div>
				</form>
			</FormProvider>
		</div>
	);
};

export const config = defineWidgetConfig({
	zone: 'promotion.details.after',
});

export default PromotionSubtotalWidget;
