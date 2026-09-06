import { useParams } from "react-router-dom";
import { useInvoice } from "@/hooks/use-invoices";
// import { useCreatePayment } from "@/hooks/use-payments";
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
import { useState } from "react";
import { PaymentForm } from "@/components/invoices/payment-form";

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orgId = localStorage.getItem("currentOrgId");
  const { data: invoice, isLoading, isError } = useInvoice(orgId, id);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !invoice)
    return <div className="text-red-500">Invoice not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Invoice {invoice.invoiceNumber}
          </h1>
          <p className="text-gray-500">
            {invoice.customer?.name || "Unknown customer"}
          </p>
        </div>
        <div className="flex gap-2">
          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
            <Button onClick={() => setShowPaymentForm(true)}>
              Add Payment
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
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitPrice}</TableCell>
                    <TableCell>{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{invoice.subtotal}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Discount</dt>
                  <dd>{invoice.discount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Tax</dt>
                  <dd>{invoice.tax}</dd>
                </div>
                <div className="flex justify-between font-bold">
                  <dt>Total</dt>
                  <dd>{invoice.total}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Status</dt>
                  <dd>
                    <Badge>{invoice.status}</Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Payment</dt>
                  <dd>
                    <Badge variant="secondary">{invoice.paymentStatus}</Badge>
                  </dd>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between">
                    <dt>Due Date</dt>
                    <dd>{new Date(invoice.dueDate).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {invoice.payments?.map((payment) => (
                  <li key={payment.id} className="flex justify-between text-sm">
                    <span>{new Date(payment.paidAt).toLocaleString()}</span>
                    <span>
                      {payment.method} - {payment.amount}
                    </span>
                  </li>
                ))}
                {invoice.payments?.length === 0 && (
                  <li className="text-gray-500">No payments recorded</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {showPaymentForm && (
        <PaymentForm
          orgId={orgId!}
          invoice={invoice}
          onClose={() => setShowPaymentForm(false)}
        />
      )}
    </div>
  );
}
