import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateLead,
  useUpdateLead,
  LEAD_STAGES,
  Lead,
} from "@/hooks/use-leads";
import { useCustomers } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const leadSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  value: z.number().min(0).default(0),
  stage: z.enum(LEAD_STAGES as [string, ...string[]]),
  assignedToId: z.string().optional(),
  expectedCloseDate: z.string().optional(),
  probability: z.number().min(0).max(100).optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  orgId: string;
  lead?: Lead | null;
  onClose: () => void;
}

export function LeadForm({ orgId, lead, onClose }: LeadFormProps) {
  const createMutation = useCreateLead(orgId);
  const updateMutation = lead ? useUpdateLead(orgId, lead.id) : null;
  const { data: customers } = useCustomers(orgId, { page: 1, limit: 100 });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead
      ? {
          customerId: lead.customerId,
          title: lead.title,
          description: lead.description || "",
          value: lead.value,
          stage: lead.stage,
          assignedToId: lead.assignedToId || "",
          probability: lead.probability || undefined,
        }
      : {
          customerId: "",
          title: "",
          description: "",
          value: 0,
          stage: "NEW",
          probability: 10,
        },
  });

  const onSubmit = async (data: LeadFormData) => {
    if (lead) {
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
          {lead ? "Edit Lead" : "Add Lead"}
        </h2>
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
            <label className="block text-sm font-medium">Title</label>
            <Input {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-xs">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Value</label>
            <Input
              type="number"
              step="0.01"
              {...register("value", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Stage</label>
            <select
              {...register("stage")}
              className="w-full border rounded p-2"
            >
              {LEAD_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Probability (%)</label>
            <Input
              type="number"
              {...register("probability", { valueAsNumber: true })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{lead ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
