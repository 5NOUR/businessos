import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  orgId: string;
  customerId?: string;
  initialData?: Partial<CustomerFormData>;
  onClose: () => void;
}

export function CustomerForm({
  orgId,
  customerId,
  initialData,
  onClose,
}: CustomerFormProps) {
  const createMutation = useCreateCustomer(orgId);
  const updateMutation = customerId
    ? useUpdateCustomer(orgId, customerId)
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      tags: [],
      notes: "",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    if (customerId) {
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
          {customerId ? "Edit Customer" : "Add Customer"}
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
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <Input {...register("phone")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Company</label>
            <Input {...register("company")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Address</label>
            <Input {...register("address")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Notes</label>
            <Input {...register("notes")} />
          </div>
          {/* Tags can be added later */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{customerId ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
