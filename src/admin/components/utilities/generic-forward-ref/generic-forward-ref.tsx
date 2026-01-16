import {
	type ReactNode,
	type Ref,
	type RefAttributes,
	forwardRef,
} from 'react';

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function genericForwardRef<T, P = {}>(
	render: (props: P, ref: Ref<T>) => ReactNode,
): (props: P & RefAttributes<T>) => ReactNode {
	return forwardRef(render) as any;
}
