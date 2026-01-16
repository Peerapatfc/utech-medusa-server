import type {
	FieldArrayWithId,
	UseFormGetValues,
	UseFormReturn,
	UseFormSetValue,
} from 'react-hook-form';
import type { z } from 'zod';
import { Fragment } from 'react/jsx-runtime';
import { Form } from '../../../common/form';
import { Checkbox, Input, Label, Select } from '@medusajs/ui';
import BundleProductField from '../../modules/product-field';
import { XMarkMini } from '@medusajs/icons';
import type { CustomOptionSchema, Tab } from '../../common/schemas';

const selectTypeOptions = [
	{
		value: 'select_one',
		label: 'Select One',
	},
	{
		value: 'multiple_select',
		label: 'Checkbox',
	},
	{
		value: 'premium',
		label: 'Premium',
	},
	{
		value: 'product_suggestions',
		label: 'Product Suggestions',
	},
];

const BundlesForm = ({
	fields,
	form,
	isLoading,
	isView,
	handleRemove,
	getValues,
	setValue,
	handleShowAddProductModal,
}: {
	fields: FieldArrayWithId<
		z.infer<typeof CustomOptionSchema>,
		'bundles',
		'bundles'
	>[];
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	form: UseFormReturn<z.infer<typeof CustomOptionSchema>, any, undefined>;
	isLoading: boolean;
	isView: boolean;
	handleRemove: (index: number) => void;
	getValues: UseFormGetValues<z.infer<typeof CustomOptionSchema>>;
	setValue: UseFormSetValue<z.infer<typeof CustomOptionSchema>>;
	handleShowAddProductModal: (indexBundle: number, tab: Tab) => void;
}) => {
	return (
		<div className='flex flex-col items-center justify-center text-ui-fg-subtle px-6'>
			<div className='flex flex-col w-full'>
				{/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
				{fields.map((_fieldRule: any, index: number) => {
					const { ref: titleRef, ...titleField } = form.register(
						`bundles.${index}.title_th`,
					);
					const { ref: titleEnRef, ...titleEnField } = form.register(
						`bundles.${index}.title_en`,
					);
					const { ref: descriptionRef, ...descriptionField } = form.register(
						`bundles.${index}.description_th`,
					);
					const { ref: descriptionEnRef, ...descriptionEnField } =
						form.register(`bundles.${index}.description_en`);
					const { ref: selectTypeRef, ...selectTypeField } = form.register(
						`bundles.${index}.selectType`,
					);
					const { ref: isRequiredRef, ...isRequiredField } = form.register(
						`bundles.${index}.isRequired`,
					);
					return (
						<Fragment key={`bundle-${index.toString()}.option`}>
							<div className='bg-ui-bg-subtle border-ui-border-base flex flex-row gap-2 rounded-xl border px-2 py-2 mb-4'>
								<div className='grow'>
									<div className='grid grid-cols-2 gap-x-3'>
										<Form.Field
											{...selectTypeField}
											render={({ field: { onChange, ref, ...field } }) => {
												return (
													<Form.Item className='mb-2'>
														<Form.Control>
															<Select
																{...field}
																value={
																	Array.isArray(field.value)
																		? field.value[0]
																		: field.value
																}
																onValueChange={onChange}
																disabled={isLoading || isView}
															>
																<Select.Trigger
																	ref={ref}
																	className='bg-ui-bg-base'
																>
																	<Select.Value placeholder='Select Type' />
																</Select.Trigger>

																<Select.Content>
																	{selectTypeOptions.map((option, i) => (
																		<Select.Item
																			key={`${index}-${option.value}-${i}`}
																			value={option.value}
																		>
																			<span className='text-ui-fg-subtle'>
																				{option.label}
																			</span>
																		</Select.Item>
																	))}
																</Select.Content>
															</Select>
														</Form.Control>

														<Form.ErrorMessage />
													</Form.Item>
												);
											}}
										/>
										<Form.Field
											{...isRequiredField}
											render={({ field: { onChange, ref, ...field } }) => {
												return (
													<Form.Item className='mb-2'>
														<Form.Control>
															<div className='flex items-center space-x-2 my-auto'>
																<Checkbox
																	{...field}
																	ref={ref}
																	id={`is-required-${index}`}
																	disabled={isLoading || isView}
																	onCheckedChange={onChange}
																	checked={field.value}
																	className='bg-ui-bg-base'
																/>
																<Label htmlFor={`is-required-${index}`}>
																	Is Required
																</Label>
															</div>
														</Form.Control>
														<Form.ErrorMessage />
													</Form.Item>
												);
											}}
										/>
									</div>
									<div className='grid grid-cols-2 gap-x-3'>
										<Form.Field
											{...titleField}
											render={({ field: { onChange, ref, ...field } }) => {
												return (
													<Form.Item className='mb-2'>
														<Form.Control>
															<Input
																{...field}
																ref={ref}
																placeholder='Title th'
																onChange={onChange}
																className='bg-ui-bg-base'
																disabled={isLoading || isView}
															/>
														</Form.Control>
														<Form.ErrorMessage />
													</Form.Item>
												);
											}}
										/>
										<Form.Field
											key={`${index}.bundles.${titleEnField.name}`}
											{...titleEnField}
											render={({ field: { onChange, ref, ...field } }) => {
												return (
													<Form.Item className='mb-2'>
														<Form.Control>
															<Input
																{...field}
																ref={ref}
																placeholder='Title en'
																onChange={onChange}
																className='bg-ui-bg-base'
																disabled={isLoading || isView}
															/>
														</Form.Control>
														<Form.ErrorMessage />
													</Form.Item>
												);
											}}
										/>
									</div>
									<div className='grid grid-cols-1 gap-x-3'>
										<Form.Field
											{...descriptionField}
											render={({ field: { onChange, ref, ...field } }) => {
												return (
													<Form.Item className='mb-2'>
														<Form.Control>
															<Input
																{...field}
																ref={ref}
																placeholder='Description th'
																onChange={onChange}
																className='bg-ui-bg-base'
																disabled={isLoading || isView}
															/>
														</Form.Control>
														<Form.ErrorMessage />
													</Form.Item>
												);
											}}
										/>
										<Form.Field
											{...descriptionEnField}
											render={({ field: { onChange, ref, ...field } }) => {
												return (
													<Form.Item className='mb-2'>
														<Form.Control>
															<Input
																{...field}
																ref={ref}
																placeholder='Description en'
																onChange={onChange}
																className='bg-ui-bg-base'
																disabled={isLoading || isView}
															/>
														</Form.Control>
														<Form.ErrorMessage />
													</Form.Item>
												);
											}}
										/>
									</div>
									<div className='grid grid-cols-1 gap-x-3'>
										<BundleProductField
											nestIndex={index}
											control={form.control}
											isLoading={isLoading}
											isView={isView}
											getValues={getValues}
											setValue={setValue}
											handleShowAddProductModal={handleShowAddProductModal}
										/>
									</div>
								</div>

								{!isView && (
									<div className='flex-none self-center px-1'>
										<XMarkMini
											className='text-ui-fg-muted cursor-pointer'
											onClick={() => handleRemove(index)}
										/>
									</div>
								)}
							</div>
						</Fragment>
					);
				})}
			</div>
		</div>
	);
};

export default BundlesForm;
