type BroadCastsDisplayTargetProps = {
	allTargets?: string[];
	showAmount?: number;
};
const BroadCastsDisplayTarget = ({
	allTargets,
	showAmount = 2,
}: BroadCastsDisplayTargetProps) => {
	const showTargets = allTargets?.filter(
		(_target, index) => index < showAmount,
	);
	const moreTargets = (allTargets?.length ?? 0) - (showTargets?.length ?? 0);
	return (
		<>
			<span>
				{showTargets?.join(', ')}
				{moreTargets > 0 && <>, +{moreTargets}</>}
			</span>
		</>
	);
};

export default BroadCastsDisplayTarget;
