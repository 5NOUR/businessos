import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateProduct,
  useUpdateProduct,
  Product,
} from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  sellingPrice: z.number().min(0),
  costPrice: z.number().min(0),
  currentStock: z.number().min(0).optional(),
  minimumStock: z.number().min(0).optional(),
  imageUrl: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  orgId: string;
  product?: Product | null;
  onClose: () => void;
}

export function ProductForm({ orgId, product, onClose }: ProductFormProps) {
  const createMutation = useCreateProduct(orgId);
  const updateMutation = product ? useUpdateProduct(orgId, product.id) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          description: product.description || "",
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
          minimumStock: product.minimumStock,
          imageUrl: product.imageUrl || "",
        }
      : {
          name: "",
          sku: "",
          description: "",
          sellingPrice: 0,
          costPrice: 0,
          currentStock: 0,
          minimumStock: 0,
          imageUrl: "",
        },
  });

  const onSubmit = async (data: ProductFormData) => {
    if (product) {
      await updateMutation!.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">
          {product ? "Edit Product" : "Add Product"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">SKU</label>
            <Input {...register("sku")} />
            {errors.sku && (
              <p className="text-red-500 text-xs">{errors.sku.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Selling Price</label>
              <Input
                type="number"
                step="0.01"
                {...register("sellingPrice", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Cost Price</label>
              <Input
                type="number"
                step="0.01"
                {...register("costPrice", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">
                Initial Stock (optional)
              </label>
              <Input
                type="number"
                {...register("currentStock", { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Minimum Stock</label>
              <Input
                type="number"
                {...register("minimumStock", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <Input {...register("description")} />
          </div>
          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <Input {...register("imageUrl")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{product ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
