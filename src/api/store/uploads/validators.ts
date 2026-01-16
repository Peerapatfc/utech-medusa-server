import { createSelectParams } from '../../utils/validators';
import type { z } from 'zod';

export type AdminGetUploadParamsType = z.infer<typeof AdminGetUploadParams>;
export const AdminGetUploadParams = createSelectParams();
