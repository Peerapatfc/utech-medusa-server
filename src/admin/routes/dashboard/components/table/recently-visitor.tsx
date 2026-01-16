import type {
	DashboardDataInsight,
	UserRecentlyVisited,
} from "@customTypes/dashboard";
import {
	Container,
	DataTable,
	Heading,
	createDataTableColumnHelper,
	useDataTable,
} from "@medusajs/ui";
import { getBuddhistDate, getTimeAgo } from "../../../../../utils/date";

interface Props {
	dashboard?: DashboardDataInsight;
}

interface UserRecently extends UserRecentlyVisited {
	duration: string;
}

const columnHelper = createDataTableColumnHelper<UserRecently>();

const columns = [
	columnHelper.accessor("name", {
		header: "Title",
	}),

	columnHelper.accessor("last_visit", {
		header: "LastVisit",
		cell: ({ getValue }) => {
			return getBuddhistDate(getValue());
		},
	}),
	columnHelper.accessor("duration", {
		header: "Duration",
	}),
];

export function RecentlyVisitor({ dashboard }: Props) {
	const usersRaw = dashboard?.users?.recently_visited ?? [];
	const users: UserRecently[] = usersRaw.map((user) => {
		return {
			...user,
			duration: getTimeAgo(user.last_visit),
		};
	});

	const table = useDataTable({
		data: users,
		columns,
		getRowId: (user) => user.user_id,
		rowCount: users.length,
		isLoading: false,
	});

	return (
		<Container>
			<DataTable instance={table}>
				<DataTable.Toolbar className="flex justify-between items-center  px-0 pt-0">
					<Heading>Recent visitor</Heading>
				</DataTable.Toolbar>
				<DataTable.Table />
			</DataTable>
		</Container>
	);
}
