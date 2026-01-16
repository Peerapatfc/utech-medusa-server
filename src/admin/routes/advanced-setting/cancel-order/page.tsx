import BackButton from '../../../components/back-button';
import {
  Button,
  Container,
  Tooltip,
  Select,
  toast,
  Table,
  usePrompt,
} from '@medusajs/ui';
import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Form } from '../../../components/common/form';
import type { CancelOrderConfigDataForm } from '../../../../types/cancel-order';
import { useTranslation } from 'react-i18next';
import { findConfigDataByPath } from '../../../../admin/utils/config-data';
import { InformationCircle, Plus, Trash } from '@medusajs/icons';
import AddConditionModalForm from './add-condition-modal';
import type { ConfigData } from '../../../../types/config-data';
import { formatProvider } from '../../../lib/format-provider';
import type { PaymentProviderDTO } from '@medusajs/framework/types';

const CancelOrderSettingPage = () => {
  const { t } = useTranslation()
  const prompt = usePrompt()

  const form = useForm<CancelOrderConfigDataForm>()
  const {
    setValue,
    handleSubmit,
  } = form
  const [openModal, setOpenModal] = useState(false)
  const [payment_methods, setPaymentMethods] = useState<ConfigData[]>([])
  const [payment_providers, setPaymentProviders] = useState<PaymentProviderDTO[]>([])

  const CANCEL_ORDER_GENERAL_ENABLED = 'cancel-order/general/enabled';
  const CANCEL_ORDER_GENERAL_CONDITION = 'cancel-order/general/condition';

  const onSubmit = handleSubmit((data: CancelOrderConfigDataForm) => {
    fetch('/admin/config-data', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => {
        toast.success(t('general.success'), {
          description: 'Cancel Order were successfully updated.',
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.error(t('general.error'), {
          description: error.message,
        });
      });
  });

  const enableOptions = [
    { value: '1', label: 'Yes' },
    { value: '0', label: 'No' },
  ];

  const reLoadData = (paymentProviders: PaymentProviderDTO[]) => {
    const method_list: Record<string, string> = {};
    paymentProviders.map((option, index) => {
      method_list[`paths[${index}]`] =
        `${CANCEL_ORDER_GENERAL_CONDITION}/${option.id}`;
    });
    const params = new URLSearchParams(method_list);
    fetch(`/admin/config-data?${params.toString()}`, {
      credentials: 'include',
      method: 'GET',
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.data) {
          setPaymentMethods(response.data);
        }
      })
      .catch((error) => {
        toast.error(t('general.error'), {
          description: error.message,
        });
      });
  };

  const onDelete = async (path: string): Promise<void> => {
    const res = await prompt({
      title: 'Delete condition',
      description: 'Are you sure you want to delete this condition?',
      confirmText: t('actions.delete'),
      cancelText: t('actions.cancel'),
    });

    if (!res) {
      return;
    }

    fetch(`/admin/config-data?path=${path}`, {
      credentials: "include",
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then(() => {
        toast.success(t("general.success"), {
          description: "Cancel order(s) were successfully deleted.",
        })
        reLoadData(payment_providers)
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(t("general.error"), {
          description: error.message,
        })
      });
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const fetchData = async () => {
      const paymentProviders = await fetch("/admin/payments/payment-providers", {
        credentials: "include",
        method: "GET",
      })
        .then((response) => response.json())
        .then((response) => response.payment_providers)
      setPaymentProviders(paymentProviders)

      setValue("general.enabled.path", CANCEL_ORDER_GENERAL_ENABLED)
      setValue("general.enabled.value", '0')
      const params = new URLSearchParams({
        'paths[0]': CANCEL_ORDER_GENERAL_ENABLED,
      });
      await fetch(`/admin/config-data?${params.toString()}`, {
        credentials: "include",
        method: "GET",
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.data) {
            const enabled_value = findConfigDataByPath(res.data, CANCEL_ORDER_GENERAL_ENABLED)
            setValue("general.enabled.value", enabled_value)
          }
        })
        .catch((error) => {
          toast.error(t("general.error"), {
            description: error.message,
          })
        })
      reLoadData(paymentProviders)
    }
    fetchData()
  }, [])

  return (
    <div className=''>
      <BackButton
        path='/advanced-setting'
        label='Back to Advanced Setting'
        className='my-4'
      />
      <Container>
        <FormProvider {...form}>
          <form onSubmit={onSubmit}>
            <div className='flex justify-between'>
              <div>
                <h1 style={{ fontWeight: '700', fontSize: '20px' }}>
                  Cancel Order
                </h1>
                <p className='mt-4 mb-6'>Config cancel order</p>
              </div>
              <Button type='submit' className='h-fit'>
                Save
              </Button>
            </div>

            <div className="flex flex-col gap-y-6 lg:ml-8 w-[100%] lg:w-1/2">
              <Form.Field
                control={form.control}
                name="general.enabled.value"
                render={({ field: { onChange, value, ...rest } }) => (
                  <Form.Item className="md:col-span-2">
                    <Form.Label className="w-full font-bold">Enabled Service</Form.Label>
                    <Form.Control>
                      <Select
                        value={value}
                        onValueChange={(newValue) => onChange(newValue)}
                        {...rest}
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Enabled Service" />
                        </Select.Trigger>
                        <Select.Content>
                          {enableOptions.map((item) => (
                            <Select.Item key={item.value} value={item.value}>
                              {item.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )}
              />
              <div className="flex flex-col space-y-2 md:col-span-2">
                <Form.Label className="w-full flex items-center font-bold gap-x-1">
                  Order Status(es)
                  <Tooltip content="[all store]">
                    <InformationCircle />
                  </Tooltip>
                  <span className="mx-[5px]">{"is"}</span>
                  <span className="text-rose-500"> {"Pending"}</span>
                </Form.Label>
              </div>
              <div className="flex flex-col space-y-2 md:col-span-2">
                <Form.Label className="w-full flex items-center font-bold gap-x-1">
                  <span className="flex items-center gap-x-1">
                    Conditions based on Payment Method
                    <Tooltip content="[all store]">
                      <InformationCircle />
                    </Tooltip>
                  </span>
                  <Button
                    variant="transparent"
                    size="small"
                    type="button"
                    className="ml-auto"
                    onClick={() => setOpenModal(true)}
                  >
                    <Plus />
                  </Button>
                </Form.Label>
              </div>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell className="w-2/4">
                      {"Payment Method(s)"}
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-1/4">
                      {"Time(Min.)"}
                    </Table.HeaderCell>
                    <Table.HeaderCell className="w-1/4" />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {payment_methods.map((method) => {
                    return (
                      <Table.Row
                        key={method.id}
                        className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
                      >
                        <Table.Cell>
                          {formatProvider(method.path.replace(`${CANCEL_ORDER_GENERAL_CONDITION}/`, ""))}
                        </Table.Cell>
                        <Table.Cell>
                          {method.value}
                        </Table.Cell>
                        <Table.Cell className="text-center">
                          <Button
                            variant="transparent"
                            size="small"
                            type="button"
                            onClick={() => onDelete(method.path)}
                          >
                            <Trash />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table>
            </div>

          </form>
        </FormProvider>
      </Container>
      <AddConditionModalForm
        openModal={openModal}
        setOpenModal={setOpenModal}
        condition_path={CANCEL_ORDER_GENERAL_CONDITION}
        paymentProviders={payment_providers}
        reLoadData={reLoadData}
      />
    </div>
  );
}

export default CancelOrderSettingPage;
