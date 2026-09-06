import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateOrder } from "@/hooks/use-orders";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).optional(),
});

const orderSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(itemSchema).min(1),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  orgId: string;
  onClose: () => void;
}

export function OrderForm({ orgId, onClose }: OrderFormProps) {
  const createMutation = useCreateOrder(orgId);
  const { data: customers } = useCustomers(orgId, { page: 1, limit: 100 });
  const { data: products } = useProducts(orgId, { page: 1, limit: 100 });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
      discount: 0,
      tax: 0,
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: OrderFormData) => {
    await createMutation.mutateAsync(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">New Order</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Customer</label>
            <select
              {...register("customerId")}
              className="w-full border rounded p-2"
            >
              <option value="">Select customer</option>
              {customers?.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-red-500 text-xs">
                {errors.customerId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Items</label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 mb-2">
                <select
                  {...register(`items.${index}.productId`)}
                  className="flex-1 border rounded p-2"
                >
                  <option value="">Select product</option>
                  {products?.items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="Qty"
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  className="w-20"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  {...register(`items.${index}.unitPrice`, {
                    valueAsNumber: true,
                  })}
                  className="w-28"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ productId: "", quantity: 1, unitPrice: 0 })
              }
            >
              Add Item
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Discount</label>
              <Input
                type="number"
                {...register("discount", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tax %</label>
              <Input
                type="number"
                {...register("tax", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Notes</label>
            <Input {...register("notes")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
