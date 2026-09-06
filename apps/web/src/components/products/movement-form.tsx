import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateMovement } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const movementSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  type: z.enum(["PURCHASE", "SALE", "RETURN", "ADJUSTMENT"]),
  quantity: z.number().positive(),
  note: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  orgId: string;
  productId?: string;
  onClose: () => void;
}

export function MovementForm({ orgId, productId, onClose }: MovementFormProps) {
  const createMovement = useCreateMovement(orgId);

  const { register, handleSubmit } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      productId: productId || "",
      type: "PURCHASE",
      quantity: 1,
      note: "",
    },
  });

  const onSubmit = async (data: MovementFormData) => {
    await createMovement.mutateAsync(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Add Inventory Movement</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Product ID</label>
            <Input {...register("productId")} readOnly={!!productId} />
          </div>
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select {...register("type")} className="w-full border rounded p-2">
              <option value="PURCHASE">Purchase</option>
              <option value="SALE">Sale</option>
              <option value="RETURN">Return</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <Input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Note</label>
            <Input {...register("note")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
