import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateSupplier,
  useUpdateSupplier,
  Supplier,
} from "@/hooks/use-suppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  orgId: string;
  supplier?: Supplier | null;
  onClose: () => void;
}

export function SupplierForm({ orgId, supplier, onClose }: SupplierFormProps) {
  const createMutation = useCreateSupplier(orgId);
  const updateMutation = supplier
    ? useUpdateSupplier(orgId, supplier.id)
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier
      ? {
          name: supplier.name,
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
          notes: supplier.notes || "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          address: "",
          notes: "",
        },
  });

  const onSubmit = async (data: SupplierFormData) => {
    if (supplier) {
      await updateMutation!.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {supplier ? "Edit Supplier" : "Add Supplier"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <Input type="email" {...register("email")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <Input {...register("phone")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <Input {...register("address")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Notes</label>
            <Input {...register("notes")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{supplier ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
