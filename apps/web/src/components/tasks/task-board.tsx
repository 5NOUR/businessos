import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useTasks, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-50 text-gray-600",
  MEDIUM: "bg-blue-50 text-blue-600",
  HIGH: "bg-orange-50 text-orange-600",
  URGENT: "bg-red-50 text-red-600",
};

interface TaskBoardProps {
  orgId: string;
  projectId?: string; // اختياري لعرض مهام مشروع محدد
}

export function TaskBoard({ orgId, projectId }: TaskBoardProps) {
  const [query] = useState({ projectId, limit: 100 });
  const { data, isLoading, isError } = useTasks(orgId, query);
  const updateStatusMutation = useUpdateTaskStatus(orgId);

  const tasks = data?.items || [];

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    updateStatusMutation.mutate({
      id: draggableId,
      status: destination.droppableId,
    });
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (isError) return <div className="text-red-500">Error loading tasks</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {TASK_STATUSES.map((status) => (
          <div
            key={status}
            className="w-64 flex-shrink-0 bg-gray-50 rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">
                {status.replace("_", " ")}
              </h3>
              <Badge variant="secondary">
                {tasks.filter((t) => t.status === status).length}
              </Badge>
            </div>

            <Droppable droppableId={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2 min-h-[100px]"
                >
                  {tasks
                    .filter((t) => t.status === status)
                    .map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card className="shadow-sm">
                              <CardContent className="p-3">
                                <p className="font-medium text-sm">
                                  {task.title}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <Badge
                                    className={
                                      priorityColors[task.priority] ||
                                      "bg-gray-100"
                                    }
                                  >
                                    {task.priority}
                                  </Badge>
                                  {task.dueDate && (
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        task.dueDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
