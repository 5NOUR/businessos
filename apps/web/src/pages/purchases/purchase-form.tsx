import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePurchaseOrder } from "@/hooks/use-purchases";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().min(1),
  unitCost: z.number().min(0),
});

const purchaseSchema = z.object({
  supplierId: z.string().min(1),
  items: z.array(itemSchema).min(1),
  notes: z.string().optional(),
});

type PurchaseFormData = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
  orgId: string;
  onClose: () => void;
}

export function PurchaseForm({ orgId, onClose }: PurchaseFormProps) {
  const createMutation = useCreatePurchaseOrder(orgId);
  const { data: suppliers } = useSuppliers(orgId, { page: 1, limit: 100 });
  const { data: products } = useProducts(orgId, { page: 1, limit: 100 });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: "",
      items: [{ productId: "", quantity: 1, unitCost: 0 }],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: PurchaseFormData) => {
    await createMutation.mutateAsync(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">New Purchase Order</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Supplier</label>
            <select
              {...register("supplierId")}
              className="w-full border rounded p-2"
            >
              <option value="">Select supplier</option>
              {suppliers?.items.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.supplierId && (
              <p className="text-red-500 text-xs">
                {errors.supplierId.message}
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
                  placeholder="Unit cost"
                  {...register(`items.${index}.unitCost`, {
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
                append({ productId: "", quantity: 1, unitCost: 0 })
              }
            >
              Add Item
            </Button>
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
