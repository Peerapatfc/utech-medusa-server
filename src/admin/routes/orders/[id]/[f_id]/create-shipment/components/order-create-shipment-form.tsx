import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import type * as zod from "zod"

import type { AdminFulfillment, AdminOrder } from "@medusajs/types"
import { Button, Heading, Input, Switch, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"

import { Form } from "../../../../../../components/common/form"
import {
  RouteFocusModal,
} from "../../../../../../components/route-modal"
import { KeyboundForm } from "../../../../../../components/utilities/keybound-form"
import { useCreateOrderShipment } from "../../../../../../hooks/api/orders"
import { CreateShipmentSchema } from "./constants"
import { useShippingOptions } from "../../../../../../hooks/api/shipping-options"
import {
  isOptionEnabledInStore,
} from "../../../../../../lib/shipping-options"
import { Combobox } from "../../../../../../components/inputs/combobox/combobox"

type OrderCreateFulfillmentFormProps = {
  order: AdminOrder & {
    no_notification: boolean
  }
  fulfillment: AdminFulfillment
}

export function OrderCreateShipmentForm({
  order,
  fulfillment,
}: OrderCreateFulfillmentFormProps) {
  const { t } = useTranslation()

  const { mutateAsync: createShipment, isPending: isMutating } =
    useCreateOrderShipment(order.id, fulfillment?.id)

  const form = useForm<zod.infer<typeof CreateShipmentSchema>>({
    defaultValues: {
      send_notification: order.no_notification,
    },
    resolver: zodResolver(CreateShipmentSchema),
  })

  // const { fields: labels, append } = useFieldArray({
  //   name: "labels",
  //   control: form.control,
  // })

  const { shipping_options = [] } = useShippingOptions(
    {
      limit: 999,
      fields: "*prices,+service_zone.fulfillment_set.location.id",
      stock_location_id: fulfillment.location_id,
    },
    {
      enabled: !!fulfillment.location_id,
    }
  )

  const handleSubmit = form.handleSubmit(async (data) => {
    await createShipment(
      {
        items: fulfillment?.items?.map((i) => ({
          id: i.line_item_id as string,
          quantity: i.quantity,
        })),
        labels: data.labels
          .filter((l) => !!l.tracking_number && !!l.label_url)
          .map((l) => ({
            tracking_number: l.tracking_number,
            tracking_url: "#",
            label_url: l.label_url,
          })),
        no_notification: !data.send_notification,
      },
      {
        onSuccess: () => {
          toast.success(t("orders.shipment.toastCreated"))
          setTimeout(() => {
            window.location.href = `${__BACKEND_URL__}/app/orders/${order.id}`
          }, 1000)
        },
        onError: (e) => {
          toast.error(e.message)
        },
      }
    )
  })

  return (
    <RouteFocusModal.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex h-full flex-col overflow-hidden"
      >
        <RouteFocusModal.Header>
          <div className="flex items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button size="small" variant="secondary">
                {t("actions.cancel")}
              </Button>
            </RouteFocusModal.Close>
            <Button size="small" type="submit" isLoading={isMutating}>
              {t("actions.save")}
            </Button>
          </div>
        </RouteFocusModal.Header>
        <RouteFocusModal.Body className="flex h-full w-full flex-col items-center divide-y overflow-y-auto">
          <div className="flex size-full flex-col items-center overflow-auto p-16">
            <div className="flex w-full max-w-[736px] flex-col justify-center px-2 pb-2">
              <div className="flex flex-col divide-y">
                <div className="flex flex-1 flex-col">
                  <Heading className="mb-4">
                    {t("orders.shipment.title")}
                  </Heading>

                  {/* {labels.map((label, index) => ( */}
                  {[{ id: 0 }].map((label, index) => (
                    <div key={label.id} className="grid grid-cols-2 gap-4">
                      <div className="w-full">
                        <Form.Field
                          control={form.control}
                          name={`labels.${index}.label_url`}
                          render={({ field }) => {
                            return (
                              <Form.Item className="mb-4">
                                {index === 0 && (
                                  <Form.Label>
                                    Delivery Method
                                  </Form.Label>
                                )}
                                <Form.Control>
                                  <Combobox
                                    options={shipping_options.filter((pp) => !isOptionEnabledInStore(pp)).map((pp) => ({
                                      label: pp.name,
                                      value: pp.name
                                    }))}
                                    {...field}
                                  />
                                </Form.Control>
                                <Form.ErrorMessage />
                              </Form.Item>
                            );
                          }}
                        />
                      </div>
                      <div className="w-full">
                        <Form.Field
                          control={form.control}
                          name={`labels.${index}.tracking_number`}
                          render={({ field }) => {
                            return (
                              <Form.Item className="mb-4">
                                {index === 0 && (
                                  <Form.Label>
                                    {t("orders.shipment.trackingNumber")}
                                  </Form.Label>
                                )}
                                <Form.Control>
                                  <Input {...field} placeholder="123-456-789" />
                                </Form.Control>
                                <Form.ErrorMessage />
                              </Form.Item>
                            )
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* <Button
                    type="button"
                    onClick={() => append({ label_url: "", tracking_number: "" })}
                    className="self-end"
                    variant="secondary"
                  >
                    {t("orders.shipment.addTracking")}
                  </Button> */}
                </div>

                <div className="mt-8 pt-8 ">
                  <Form.Field
                    control={form.control}
                    name="send_notification"
                    render={({ field: { onChange, value, ...field } }) => {
                      return (
                        <Form.Item>
                          <div className="flex items-center justify-between">
                            <Form.Label>
                              {t("orders.shipment.sendNotification")}
                            </Form.Label>
                            <Form.Control>
                              <Form.Control>
                                <Switch
                                  checked={!!value}
                                  onCheckedChange={onChange}
                                  {...field}
                                />
                              </Form.Control>
                            </Form.Control>
                          </div>
                          <Form.Hint className="!mt-1">
                            {t("orders.shipment.sendNotificationHint")}
                          </Form.Hint>
                          <Form.ErrorMessage />
                        </Form.Item>
                      )
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </RouteFocusModal.Body>
      </KeyboundForm>
    </RouteFocusModal.Form>
  )
}
