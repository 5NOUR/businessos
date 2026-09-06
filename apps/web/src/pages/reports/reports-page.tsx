import { useState } from "react";
import { useReport } from "@/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function ReportsPage() {
  const orgId = localStorage.getItem("currentOrgId");
  const [type, setType] = useState("sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, isError } = useReport(orgId, {
    type,
    startDate,
    endDate,
  });

  if (!orgId) return <div>Please select an organization</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button
          onClick={() => {
            const params = new URLSearchParams();
            params.set("type", type);
            if (startDate) params.set("startDate", startDate);
            if (endDate) params.set("endDate", endDate);
            window.open(
              `http://localhost:4000/api/reports/export?${params.toString()}`,
              "_blank",
            );
          }}
        >
          Export CSV
        </Button>
      </div>

      <div className="flex gap-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border rounded p-2"
        >
          <option value="sales">Sales</option>
          <option value="revenue">Revenue</option>
          <option value="expenses">Expenses</option>
          <option value="inventory">Inventory</option>
          <option value="customers">Customers</option>
          <option value="employees">Employees</option>
        </select>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : isError || !data ? (
        <div className="text-red-500">Error loading report</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{type} Report</CardTitle>
          </CardHeader>
          <CardContent>
            {data.data && data.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(data.data[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((row: any, index: number) => (
                    <TableRow key={index}>
                      {Object.keys(row).map((key) => (
                        <TableCell key={key}>
                          {String(row[key] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-gray-500">No data found</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
