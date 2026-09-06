import { useParams } from "react-router-dom";
import { useProject } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
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
import { Plus } from "lucide-react";
import { TaskForm } from "@/components/tasks/task-form";
import { useState } from "react";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orgId = localStorage.getItem("currentOrgId");
  const { data: project, isLoading, isError } = useProject(orgId, id);
  const { data: tasksData, isLoading: tasksLoading } = useTasks(orgId, {
    projectId: id,
    limit: 100,
  });
  const [showTaskForm, setShowTaskForm] = useState(false);

  if (isLoading || tasksLoading) return <div>Loading...</div>;
  if (isError || !project)
    return <div className="text-red-500">Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-500">{project.description}</p>
        </div>
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasksData?.items.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <Badge>{task.status}</Badge>
                  </TableCell>
                  <TableCell>{task.priority}</TableCell>
                  <TableCell>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
              {tasksData?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No tasks yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showTaskForm && (
        <TaskForm
          orgId={orgId!}
          projectId={id!}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
}
