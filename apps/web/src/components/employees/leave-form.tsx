import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateLeave } from "@/hooks/use-leaves";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const leaveSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  type: z.string().min(1, "Type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().optional(),
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveFormProps {
  orgId: string;
  employeeId?: string;
  onClose: () => void;
}

export function LeaveForm({ orgId, employeeId, onClose }: LeaveFormProps) {
  const createLeave = useCreateLeave(orgId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      employeeId: employeeId || "",
      type: "Annual",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  const onSubmit = async (data: LeaveFormData) => {
    await createLeave.mutateAsync(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Request Leave</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Employee ID</label>
            <Input {...register("employeeId")} readOnly={!!employeeId} />
            {errors.employeeId && (
              <p className="text-red-500 text-xs">
                {errors.employeeId.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select {...register("type")} className="w-full border rounded p-2">
              <option value="Annual">Annual</option>
              <option value="Sick">Sick</option>
              <option value="Personal">Personal</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <Input type="date" {...register("endDate")} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Reason</label>
            <Input {...register("reason")} />
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
