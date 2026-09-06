import { useState } from "react";
import { useInvoices, useDeleteInvoice } from "@/hooks/use-invoices";
import { Button } from "@/components/ui/button";
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
import { Plus, ChevronRight, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export function InvoicesPage() {
  const orgId = localStorage.getItem("currentOrgId");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading, isError } = useInvoices(orgId, { page, limit: 10 });
  const deleteMutation = useDeleteInvoice(orgId);

  if (!orgId) return <div>Please select an organization</div>;
  if (isLoading) return <div>Loading...</div>;
  if (isError || !data)
    return <div className="text-red-500">Error loading invoices</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices ({data.meta.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <button
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      {invoice.invoiceNumber}
                    </button>
                  </TableCell>
                  <TableCell>{invoice.customer?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "PAID"
                          ? "success"
                          : invoice.status === "OVERDUE"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.total}</TableCell>
                  <TableCell>
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(invoice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No invoices found
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
        <InvoiceForm orgId={orgId} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
