import { useState } from "react";
import { useSearch } from "@/hooks/use-search";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function SearchPage() {
  const orgId = localStorage.getItem("currentOrgId");
  const [query, setQuery] = useState("");
  const [entity, setEntity] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useSearch(orgId, query, entity, page);

  const renderSection = (title: string, items: any[], columns: string[]) => {
    if (!items || items.length === 0) return null;
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {title} ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((col) => (
                    <TableCell key={col}>{String(item[col] ?? "")}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Search</h1>
        <select
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            setPage(1);
          }}
          className="border rounded p-2"
        >
          <option value="all">All</option>
          <option value="customers">Customers</option>
          <option value="products">Products</option>
          <option value="orders">Orders</option>
          <option value="invoices">Invoices</option>
          <option value="employees">Employees</option>
        </select>
        <Input
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : isError || !data ? (
        <div className="text-gray-500">
          Type at least 3 characters to search
        </div>
      ) : (
        <div className="space-y-6">
          {renderSection("Customers", data.results.customers?.items, [
            "name",
            "email",
            "company",
            "status",
          ])}
          {renderSection("Products", data.results.products?.items, [
            "name",
            "sku",
            "currentStock",
            "sellingPrice",
          ])}
          {renderSection("Orders", data.results.orders?.items, [
            "orderNumber",
            "status",
            "total",
            "createdAt",
          ])}
          {renderSection("Invoices", data.results.invoices?.items, [
            "invoiceNumber",
            "status",
            "total",
            "dueDate",
          ])}
          {renderSection("Employees", data.results.employees?.items, [
            "name",
            "position",
            "department",
            "status",
          ])}
        </div>
      )}
    </div>
  );
}
