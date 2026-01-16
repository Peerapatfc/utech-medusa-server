import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Text } from "@medusajs/ui";
import { useEffect, useState } from "react";
import { SectionRow } from "../../../components/common/section";
import type { PaymentRestriction } from "@customTypes/payment-restriction";
import { formatProvider } from "../../../lib/format-provider";
import { Link, useParams } from "react-router-dom";
import { PencilSquare } from "@medusajs/icons";

const PaymentRestrictionWidget = () => {
	const { id } = useParams();
	const [loading, setLoading] = useState(true);
	const [payment_restrictions, setPaymentRestrictions] = useState<PaymentRestriction[]>([])

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			const params = new URLSearchParams({
				"skip": "0",
				"take": "999",
			});
			const [payment_restrictions] = await fetch(`/admin/payment-restrictions?${params}`, {
				credentials: "include",
				method: "GET",
			})
				.then((response) => response.json())
				.then((response) => response.payment_restriction)
			setPaymentRestrictions(payment_restrictions)
			setLoading(false)
		}
		fetchData()
	}, [])

	if (loading) return <Text>Loading...</Text>;

	const restrictions: PaymentRestriction[] = []
	if (payment_restrictions.length > 0) {
		payment_restrictions.map((restriction) => {
			let count = 0
			const hasRules = restriction.payment_restriction_rules?.filter((rule) => rule.attribute === "items.product.id") ?? []
			hasRules.map((rule) => {
				const hasValue = rule.payment_restriction_rule_values?.filter((value) => value.value === id) ?? []
				count = count + hasValue.length
			})
			if (count > 0) {
				restrictions.push(restriction)
			}
		})
	}

	return (
		<div className="flex flex-col gap-y-3">
			<Container className="divide-y p-0">
				<div className="flex items-center justify-between px-6 py-4">
					<Heading level="h2">Payment Restrictions</Heading>
				</div>

				{restrictions.length > 0 ? (
					restrictions.map((restriction) => {
						return (
							<SectionRow
								key={restriction.id}
								title={restriction.name}
								value={(
									<ul>
										{restriction.payment_providers.map((payment, index) => {
											return (
												<li key={index.toString()} className="font-medium font-sans txt-compact-small">
													{formatProvider(payment)}
												</li>
											)
										})}
									</ul>
								)}
								actions={(
									<Link className="font-medium font-sans txt-compact-small" to={`/advanced-setting/payment-restriction?id=${restriction.id}`}>
										<PencilSquare className="mr-0" />
									</Link>
								)}
							/>
						)
					})
				) : (
					<Text className="px-6 py-4">No payment restriction available.</Text>
				)}
			</Container>
		</div>
	);
};

export const config = defineWidgetConfig({
	zone: "product.details.side.after",
});

export default PaymentRestrictionWidget;
