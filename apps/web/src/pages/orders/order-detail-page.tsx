import { useParams } from "react-router-dom";
import { useOrder, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orgId = localStorage.getItem("currentOrgId");
  const { data: order, isLoading, isError } = useOrder(orgId, id);
  const updateStatusMutation = useUpdateOrderStatus(orgId);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !order)
    return <div className="text-red-500">Order not found</div>;

  const handleStatusChange = (newStatus: string) => {
    updateStatusMutation.mutate({ id: order.id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-gray-500">
            {order.customer?.name || "Unknown customer"}
          </p>
        </div>
        <div className="flex gap-2">
          {order.status === "PENDING" && (
            <>
              <Button
                onClick={() => handleStatusChange("CONFIRMED")}
                variant="outline"
              >
                Confirm
              </Button>
              <Button
                onClick={() => handleStatusChange("CANCELLED")}
                variant="destructive"
              >
                Cancel
              </Button>
            </>
          )}
          {order.status === "CONFIRMED" && (
            <Button onClick={() => handleStatusChange("PROCESSING")}>
              Start Processing
            </Button>
          )}
          {order.status === "PROCESSING" && (
            <Button onClick={() => handleStatusChange("SHIPPED")}>
              Mark Shipped
            </Button>
          )}
          {order.status === "SHIPPED" && (
            <Button onClick={() => handleStatusChange("COMPLETED")}>
              Complete Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.name || "Unknown"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitPrice}</TableCell>
                    <TableCell>{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{order.subtotal}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Discount</dt>
                <dd>{order.discount}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Tax</dt>
                <dd>{order.tax}</dd>
              </div>
              <div className="flex justify-between font-bold">
                <dt>Total</dt>
                <dd>{order.total}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Status</dt>
                <dd>
                  <Badge>{order.status}</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Payment</dt>
                <dd>
                  <Badge variant="secondary">{order.paymentStatus}</Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
