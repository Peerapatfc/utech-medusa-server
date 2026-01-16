import { useParams } from "react-router-dom"

import { RouteFocusModal } from "../../../../../components/route-modal"
import { useOrder } from "../../../../../hooks/api/orders"
import { OrderCreateShipmentForm } from "./components/order-create-shipment-form"

const OrderCreateShipmentCustomerPage = () => {
  const { id, f_id } = useParams()

  const { order, isLoading, isError, error } = useOrder(String(id), {
    fields: "*fulfillments,*fulfillments.items",
  })

  if (isError) {
    throw error
  }

  const ready = !isLoading && order
  return (
    <RouteFocusModal prev='../..'>
      {ready && (
        <OrderCreateShipmentForm
          order={order}
          fulfillment={order.fulfillments?.find((f: { id: string | undefined }) => f.id === f_id)}
        />
      )}
    </RouteFocusModal>
  )
}

export default OrderCreateShipmentCustomerPage