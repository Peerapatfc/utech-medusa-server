import type { FileType } from '../../../../../../components/common/file-upload';
import type { UseFormReturn } from 'react-hook-form';
import type { BroadCastsCreateSchemaType } from './schema';
import { IconBadge, IconButton, Text } from '@medusajs/ui';
import { Spinner, StackPerspective, XMarkMini } from '@medusajs/icons';
import { humanFileSize } from '../../../../common/utils';
import { Link } from 'react-router-dom';

export const BroadCastsPreviewImage = ({
	image,
	form,
	isImageUploading,
	handleImageDelete,
	currentImage,
}: {
	image?: FileType;
	form: UseFormReturn<BroadCastsCreateSchemaType>;
	isImageUploading: boolean;
	handleImageDelete: () => void;
	currentImage?: string;
}) => {
	return (
		<>
			{image?.file?.name && !form.formState.errors.image_url && (
				<div className='bg-ui-contrast-bg-subtle border-ui-contrast-border-bot relative h-full overflow-y-auto rounded-lg border p-3 flex items-center justify-between gap-3'>
					<div className='flex flex-row gap-3'>
						<Link to={image.url} target='_blank'>
							<img
								src={image.url}
								alt='broadcasts-media'
								className='w-12 object-cover object-center'
							/>
						</Link>
						<div className='flex flex-col gap-1'>
							<Text size='small'>
								<Link to={image.url} target='_blank'>
									{image.file.name}
								</Link>
							</Text>
							{isImageUploading ? (
								<Text
									size='small'
									className='flex flex-row items-center gap-2 text-ui-bg-interactive'
								>
									{'Preprocessing...'}
								</Text>
							) : (
								<Text size='small' className='flex flex-row items-center gap-2'>
									<IconBadge size='base' color='blue' className='rounded-full'>
										<StackPerspective />
									</IconBadge>
									{humanFileSize(image.file.size, true)}
								</Text>
							)}
						</div>
					</div>
					{isImageUploading ? (
						<Spinner className='animate-spin' />
					) : (
						<IconButton
							size='small'
							variant='transparent'
							type='button'
							onClick={() => handleImageDelete()}
						>
							<XMarkMini />
						</IconButton>
					)}
				</div>
			)}
			{image?.file?.name && form.formState.errors.image_url && (
				<div className='bg-ui-contrast-bg-subtle border-ui-contrast-border-bot relative h-full overflow-y-auto rounded-lg border p-3 flex items-center justify-between gap-3'>
					<div className='flex flex-row gap-3'>
						<Link to={image.url} target='_blank'>
							<img
								src={image.url}
								alt='broadcasts-media'
								className='w-12 object-cover object-center'
							/>
						</Link>
						<div className='flex flex-col gap-1'>
							<Text size='small'>
								<Link to={image.url} target='_blank'>
									{image.file.name}
								</Link>
							</Text>
							<Text
								size='small'
								className='flex flex-row items-center gap-2 text-ui-fg-error'
							>
								<IconBadge size='base' color='blue' className='rounded-full'>
									<StackPerspective />
								</IconBadge>
								{form.formState.errors.image_url.message}
							</Text>
						</div>
					</div>
					<IconButton
						size='small'
						variant='transparent'
						type='button'
						onClick={() => handleImageDelete()}
					>
						<XMarkMini />
					</IconButton>
				</div>
			)}
			{currentImage && (
				<div className='bg-ui-contrast-bg-subtle border-ui-contrast-border-bot relative h-full overflow-y-auto rounded-lg border p-3 flex items-center justify-between gap-3'>
					<div className='flex flex-row gap-3'>
						<Link to={currentImage} target='_blank'>
							<img
								src={currentImage}
								alt='broadcasts-media'
								className='w-12 object-cover object-center'
							/>
						</Link>
						<div className='flex flex-col gap-1'>
							<Text size='small'>
								<Link to={currentImage} target='_blank'>
									{currentImage}
								</Link>
							</Text>
						</div>
					</div>
					<IconButton
						size='small'
						variant='transparent'
						type='button'
						onClick={() => handleImageDelete()}
					>
						<XMarkMini />
					</IconButton>
				</div>
			)}
		</>
	);
};
