import {
  useCurrentSubscription,
  usePlans,
  useUpdateSubscription,
  useCancelSubscription,
} from "@/hooks/use-subscriptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SubscriptionsPage() {
  const orgId = localStorage.getItem("currentOrgId");
  const { data: subscription, isLoading: loadingSub } =
    useCurrentSubscription(orgId);
  const { data: plans, isLoading: loadingPlans } = usePlans();
  const updateMutation = useUpdateSubscription(orgId);
  const cancelMutation = useCancelSubscription(orgId);

  if (!orgId) return <div>Please select an organization</div>;
  if (loadingSub || loadingPlans) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscription</h1>
        {subscription && (
          <Badge
            variant={subscription.status === "ACTIVE" ? "success" : "secondary"}
          >
            {subscription.status}
          </Badge>
        )}
      </div>

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan: {subscription.plan.displayName}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt>Price</dt>
                <dd>${subscription.plan.price}/mo</dd>
              </div>
              <div className="flex justify-between">
                <dt>Max Users</dt>
                <dd>{subscription.plan.maxUsers}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Max Customers</dt>
                <dd>{subscription.plan.maxCustomers}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Max Products</dt>
                <dd>{subscription.plan.maxProducts}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Max Orders</dt>
                <dd>{subscription.plan.maxOrders}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Renewal Date</dt>
                <dd>
                  {subscription.renewalDate
                    ? new Date(subscription.renewalDate).toLocaleDateString()
                    : "N/A"}
                </dd>
              </div>
            </dl>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => cancelMutation.mutate()}
            >
              Cancel Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {plans?.map((plan) => (
          <Card
            key={plan.id}
            className={
              plan.id === subscription?.planId ? "border-2 border-primary" : ""
            }
          >
            <CardHeader>
              <CardTitle>{plan.displayName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${plan.price}
                <span className="text-sm text-gray-500">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>Users: {plan.maxUsers}</li>
                <li>Customers: {plan.maxCustomers}</li>
                <li>Products: {plan.maxProducts}</li>
                <li>Orders: {plan.maxOrders}</li>
              </ul>
              {plan.id !== subscription?.planId ? (
                <Button
                  className="mt-4 w-full"
                  onClick={() =>
                    updateMutation.mutate({ planId: plan.id, status: "ACTIVE" })
                  }
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending
                    ? "Updating..."
                    : "Switch to " + plan.displayName}
                </Button>
              ) : (
                <Button className="mt-4 w-full" disabled>
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
