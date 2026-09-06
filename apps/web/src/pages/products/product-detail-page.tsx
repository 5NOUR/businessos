import { useParams } from "react-router-dom";
import { useProduct, useMovementsForProduct } from "@/hooks/use-products";
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

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orgId = localStorage.getItem("currentOrgId");
  const { data: product, isLoading, isError } = useProduct(orgId, id);
  const { data: movements, isLoading: movementsLoading } =
    useMovementsForProduct(orgId, id);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !product)
    return <div className="text-red-500">Product not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <Badge
          variant={
            product.currentStock <= product.minimumStock ? "warning" : "success"
          }
        >
          {product.currentStock} in stock
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
                <dt>SKU</dt>
                <dd>{product.sku}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Selling Price</dt>
                <dd>{product.sellingPrice}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Cost Price</dt>
                <dd>{product.costPrice}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Minimum Stock</dt>
                <dd>{product.minimumStock}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Created</dt>
                <dd>{new Date(product.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Movements</CardTitle>
          </CardHeader>
          <CardContent>
            {movementsLoading ? (
              <div>Loading movements...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements?.map((movement: any) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.type}</TableCell>
                      <TableCell
                        className={
                          movement.quantity < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {movement.quantity}
                      </TableCell>
                      <TableCell>
                        {new Date(movement.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {movements?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-gray-500"
                      >
                        No movements
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
