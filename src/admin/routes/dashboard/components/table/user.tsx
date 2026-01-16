import type { DashboardDataInsight } from "@customTypes/dashboard";
import { Container, Heading } from "@medusajs/ui";

interface Props {
	dashboard?: DashboardDataInsight;
}

interface Data {
	id: string;
	label: string;
	value: string;
}

const UserTable = ({ dashboard }: Props) => {
	const totalRegister =
		dashboard?.users?.registration_trend?.reduce(
			(total, current) => total + current.count,
			0,
		) || 0;
	const totalVisit = dashboard?.users?.recently_visited?.length || 0;
	const totalPurchased =
		dashboard?.users?.recent_purchasers?.reduce(
			(total, current) => total + current.count,
			0,
		) || 0;
	const data: Data[] = [
		{
			id: "user_register",
			label: "registered customer",
			value: totalRegister.toString(),
		},
		{
			id: "user_visit",
			label: "recent visit count",
			value: totalVisit?.toString() ?? "",
		},
		{
			id: "user_purchase",
			label: "recent purchaser",
			value: totalPurchased.toString(),
		},
	];
	return (
		<Container>
			<Heading>Recent visitor</Heading>
			<ul className="flex flex-col divide-y gap-x-6 mb-6">
				{data?.map((item) => {
					return (
						<li
							key={item.id}
							className="hover:bg-blue-100 flex justify-between p-4 hover:rounded-lg cursor-pointer"
						>
							<div className="text-sm">{item.label}</div>
							<div className="text-xl">{item.value}</div>
						</li>
					);
				})}
			</ul>
		</Container>
	);
};

export default UserTable;
