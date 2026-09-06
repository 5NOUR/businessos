import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const orgSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

type OrgFormData = z.infer<typeof orgSchema>;

export function CreateOrganizationPage() {
  const navigate = useNavigate();
  const setCurrentOrgId = useAuthStore((state) => state.setCurrentOrgId);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrgFormData>({
    resolver: zodResolver(orgSchema),
  });

  const onSubmit = async (data: OrgFormData) => {
    try {
      const org = await apiFetch<any>("/organizations", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setCurrentOrgId(org.id);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to create organization");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium">
                Organization Name
              </label>
              <Input {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
