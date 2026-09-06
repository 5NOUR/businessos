import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useLeads, useUpdateLeadStage, LEAD_STAGES } from "@/hooks/use-leads";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import { LeadForm } from "@/components/leads/lead-form";

export function LeadsPage() {
  const orgId = localStorage.getItem("currentOrgId");
  const { data, isLoading, isError } = useLeads(orgId);
  const updateStageMutation = useUpdateLeadStage(orgId);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  const leads = data?.items || [];

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    updateStageMutation.mutate({
      id: draggableId,
      stage: destination.droppableId,
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">Error loading leads</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales Pipeline</h1>
        <Button
          onClick={() => {
            setEditingLead(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Lead
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {LEAD_STAGES.map((stage) => (
            <div
              key={stage}
              className="w-64 flex-shrink-0 bg-gray-50 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{stage}</h3>
                <Badge variant="secondary">
                  {leads.filter((l) => l.stage === stage).length}
                </Badge>
              </div>
              <Droppable droppableId={stage}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2 min-h-[100px]"
                  >
                    {leads
                      .filter((l) => l.stage === stage)
                      .map((lead, index) => (
                        <Draggable
                          key={lead.id}
                          draggableId={lead.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card>
                                <CardContent className="p-3">
                                  <p className="font-medium">{lead.title}</p>
                                  <p className="text-xs text-gray-500">
                                    {lead.customer?.name || "Unknown"}
                                  </p>
                                  <p className="text-sm font-semibold">
                                    ${lead.value}
                                  </p>
                                  <div className="flex gap-1 mt-2">
                                    <button
                                      onClick={() => {
                                        setEditingLead(lead);
                                        setShowForm(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button>
                                      <Trash2 className="h-4 w-4" />
                                    </button>
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

      {showForm && (
        <LeadForm
          orgId={orgId!}
          lead={editingLead}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
