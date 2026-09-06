import { useState } from "react";
import { useCustomers, useDeleteCustomer } from "@/hooks/use-customers";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Pencil, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CustomerForm } from "@/components/customers/customer-form";

export function CustomersPage() {
  const orgId = localStorage.getItem("currentOrgId");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  // استخدام debounce لتأخير البحث 400ms بعد توقف الكتابة
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError } = useCustomers(orgId, {
    search: debouncedSearch,
    page,
    limit: 10,
  });
  const deleteMutation = useDeleteCustomer(orgId);

  if (!orgId) {
    return <div>Please select an organization</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !data) {
    return <div className="text-red-500">Error loading customers</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List ({data.meta.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <button
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      {customer.name}
                    </button>
                  </TableCell>
                  <TableCell>{customer.email || "—"}</TableCell>
                  <TableCell>{customer.company || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.status === "ACTIVE" ? "success" : "secondary"
                      }
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/customers/${customer.id}/edit`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No customers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              variant="outline"
            >
              Previous
            </Button>
            <span>
              Page {data.meta.page} of {data.meta.totalPages}
            </span>
            <Button
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage(page + 1)}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <CustomerForm orgId={orgId} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
