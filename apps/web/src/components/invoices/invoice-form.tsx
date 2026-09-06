// import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { useCustomers } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const itemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, "Description required"),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).optional(),
});

const invoiceSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(itemSchema).min(1),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  orgId: string;
  onClose: () => void;
}

export function InvoiceForm({ orgId, onClose }: InvoiceFormProps) {
  const createMutation = useCreateInvoice(orgId);
  const { data: customers } = useCustomers(orgId, { page: 1, limit: 100 });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: "",
      items: [{ productId: "", description: "", quantity: 1, unitPrice: 0 }],
      discount: 0,
      tax: 0,
      dueDate: "",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: InvoiceFormData) => {
    await createMutation.mutateAsync(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">New Invoice</h2>
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
                <Input
                  placeholder="Description"
                  {...register(`items.${index}.description`)}
                  className="flex-1"
                />
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
                append({
                  productId: "",
                  description: "",
                  quantity: 1,
                  unitPrice: 0,
                })
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
            <div>
              <label className="block text-sm font-medium">Due Date</label>
              <Input type="date" {...register("dueDate")} />
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
