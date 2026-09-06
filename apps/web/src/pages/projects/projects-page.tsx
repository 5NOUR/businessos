import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Plus, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProjectForm } from "@/components/projects/project-form";

export function ProjectsPage() {
  const orgId = localStorage.getItem("currentOrgId");
  const [page] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { data, isLoading, isError } = useProjects(orgId, { page, limit: 10 });

  if (!orgId) return <div>Please select an organization</div>;
  if (isLoading) return <div>Loading...</div>;
  if (isError || !data)
    return <div className="text-red-500">Error loading projects</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects ({data.meta.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      {project.name}
                    </button>
                  </TableCell>
                  <TableCell>{project.status}</TableCell>
                  <TableCell>
                    {project.dueDate
                      ? new Date(project.dueDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No projects found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showForm && (
        <ProjectForm orgId={orgId} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
