import { useState } from "react";
import {
  usePurchaseOrders,
  useReceivePurchaseOrder,
} from "@/hooks/use-purchases";
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
import { Plus, Check } from "lucide-react";
import { PurchaseForm } from "./purchase-form";

export function PurchasesPage() {
  const orgId = localStorage.getItem("currentOrgId");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, isError } = usePurchaseOrders(orgId, {
    page,
    limit: 10,
  });
  const receiveMutation = useReceivePurchaseOrder(orgId);

  if (!orgId) return <div>Please select an organization</div>;
  if (isLoading) return <div>Loading...</div>;
  if (isError || !data)
    return <div className="text-red-500">Error loading purchase orders</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({data.meta.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.supplier?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "RECEIVED" ? "success" : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {order.status !== "RECEIVED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => receiveMutation.mutate(order.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Receive
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No purchase orders
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
        <PurchaseForm orgId={orgId} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
