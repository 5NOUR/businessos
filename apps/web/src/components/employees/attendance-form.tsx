import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAttendance } from "@/hooks/use-attendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const attendanceSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "LEAVE"]),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  notes: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface AttendanceFormProps {
  orgId: string;
  employeeId?: string; // اختياري، إذا مررناها من صفحة الموظف
  onClose: () => void;
}

export function AttendanceForm({
  orgId,
  employeeId,
  onClose,
}: AttendanceFormProps) {
  const createAttendance = useCreateAttendance(orgId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employeeId: employeeId || "",
      date: new Date().toISOString().slice(0, 10),
      status: "PRESENT",
    },
  });

  const onSubmit = async (data: AttendanceFormData) => {
    await createAttendance.mutateAsync(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Record Attendance</h2>
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
            <label className="block text-sm font-medium">Date</label>
            <Input type="date" {...register("date")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              {...register("status")}
              className="w-full border rounded p-2"
            >
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="LEAVE">Leave</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Check In</label>
              <Input type="datetime-local" {...register("checkIn")} />
            </div>
            <div>
              <label className="block text-sm font-medium">Check Out</label>
              <Input type="datetime-local" {...register("checkOut")} />
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
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
