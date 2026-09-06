import { useParams } from "react-router-dom";
import { useCustomer } from "@/hooks/use-customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orgId = localStorage.getItem("currentOrgId");
  const { data: customer, isLoading, isError } = useCustomer(orgId, id);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !customer)
    return <div className="text-red-500">Customer not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <Badge variant={customer.status === "ACTIVE" ? "success" : "secondary"}>
          {customer.status}
        </Badge>
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
                <dd>{customer.email || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Phone</dt>
                <dd>{customer.phone || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Company</dt>
                <dd>{customer.company || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Address</dt>
                <dd>{customer.address || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Created</dt>
                <dd>{new Date(customer.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {/* We'll implement orders later */}
            <p className="text-gray-500">No orders yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
