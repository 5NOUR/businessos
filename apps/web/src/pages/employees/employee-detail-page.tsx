import { useParams } from "react-router-dom";
import { useEmployee } from "@/hooks/use-employees";
import { useAttendanceList } from "@/hooks/use-attendance";
import { useLeaves } from "@/hooks/use-leaves";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orgId = localStorage.getItem("currentOrgId");

  const {
    data: employee,
    isLoading: empLoading,
    isError: empError,
  } = useEmployee(orgId, id);
  const { data: attendance, isLoading: attLoading } = useAttendanceList(orgId, {
    employeeId: id,
  });
  const { data: leaves, isLoading: leavesLoading } = useLeaves(orgId, {
    employeeId: id,
  });

  if (empLoading || attLoading || leavesLoading) return <div>Loading...</div>;
  if (empError || !employee)
    return <div className="text-red-500">Employee not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">
          {employee.member?.user?.name || "N/A"}
        </h1>
        <Badge>{employee.status}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt>Email</dt>
                <dd>{employee.member?.user?.email || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Position</dt>
                <dd>{employee.position || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Department</dt>
                <dd>{employee.department || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Salary</dt>
                <dd>{employee.salary ?? "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Join Date</dt>
                <dd>
                  {employee.joinDate
                    ? new Date(employee.joinDate).toLocaleDateString()
                    : "N/A"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance?.slice(0, 5).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{record.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {attendance?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-gray-500"
                    >
                      No attendance records
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves?.slice(0, 5).map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>
                    {new Date(leave.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(leave.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        leave.status === "APPROVED"
                          ? "success"
                          : leave.status === "REJECTED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {leave.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {leaves?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No leave requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
