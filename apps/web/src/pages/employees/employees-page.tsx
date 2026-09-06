import { useState } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Plus, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmployeeForm } from "@/components/employees/employee-form";

export function EmployeesPage() {
  const orgId = localStorage.getItem("currentOrgId");
  const [page] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading, isError } = useEmployees(orgId, { page, limit: 10 });

  if (!orgId) return <div>Please select an organization</div>;
  if (isLoading) return <div>Loading...</div>;
  if (isError || !data)
    return <div className="text-red-500">Error loading employees</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Employee
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employees ({data.meta.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.member?.user?.name || "N/A"}</TableCell>
                  <TableCell>{employee.member?.user?.email || "N/A"}</TableCell>
                  <TableCell>{employee.position || "N/A"}</TableCell>
                  <TableCell>{employee.department || "N/A"}</TableCell>
                  <TableCell>{employee.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/employees/${employee.id}`)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showForm && (
        <EmployeeForm orgId={orgId} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
