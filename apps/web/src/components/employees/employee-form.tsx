import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateEmployee } from "@/hooks/use-employees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const employeeSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  position: z.string().optional(),
  department: z.string().optional(),
  salary: z.number().optional(),
  joinDate: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  orgId: string;
  onClose: () => void;
}

export function EmployeeForm({ orgId, onClose }: EmployeeFormProps) {
  const createMutation = useCreateEmployee(orgId);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { memberId: "", position: "", department: "", joinDate: "" },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    await createMutation.mutateAsync(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Add Employee</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Member ID</label>
            <Input
              {...register("memberId")}
              placeholder="OrganizationMember ID"
            />
            {errors.memberId && (
              <p className="text-red-500 text-xs">{errors.memberId.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Position</label>
            <Input {...register("position")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Department</label>
            <Input {...register("department")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Salary</label>
            <Input
              type="number"
              step="0.01"
              {...register("salary", { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Join Date</label>
            <Input type="date" {...register("joinDate")} />
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
