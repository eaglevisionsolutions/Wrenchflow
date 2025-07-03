import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Eye, 
  Edit, 
  Check,
  ClipboardList
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import WorkOrderForm from "@/components/WorkOrderForm";
import type { WorkOrder, Customer, Equipment, User } from "@shared/schema";
import { format } from "date-fns";

export default function WorkOrders() {
  const [selectedShop] = useLocalStorage("selectedShop", null);
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: [`/api/shops/${selectedShop?.id}/work-orders`],
    enabled: !!selectedShop?.id,
  });

  const filteredWorkOrders = workOrders.filter((order: WorkOrder) =>
    statusFilter === "all" || order.status === statusFilter
  );

  const statusCounts = {
    all: workOrders.length,
    open: workOrders.filter((w: WorkOrder) => w.status === "open").length,
    in_progress: workOrders.filter((w: WorkOrder) => w.status === "in_progress").length,
    ready_for_pickup: workOrders.filter((w: WorkOrder) => w.status === "ready_for_pickup").length,
    completed: workOrders.filter((w: WorkOrder) => w.status === "completed").length,
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
    setShowWorkOrderForm(true);
  };

  const handleCloseForm = () => {
    setShowWorkOrderForm(false);
    setEditingWorkOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "status-open";
      case "in_progress": return "status-in_progress";
      case "ready_for_pickup": return "status-ready_for_pickup";
      case "completed": return "status-completed";
      case "canceled": return "status-canceled";
      default: return "status-open";
    }
  };

  if (!selectedShop) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a shop to view work orders</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <Button onClick={() => setShowWorkOrderForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      {/* Status Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all", label: "All" },
              { key: "open", label: "Open" },
              { key: "in_progress", label: "In Progress" },
              { key: "ready_for_pickup", label: "Ready" },
              { key: "completed", label: "Completed" },
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={statusFilter === filter.key ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.key)}
              >
                {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Table */}
      {isLoading ? (
        <div className="text-center py-8">Loading work orders...</div>
      ) : filteredWorkOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No work orders found</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter !== "all" 
                ? `No ${statusFilter.replace('_', ' ')} work orders found`
                : "Get started by creating your first work order"
              }
            </p>
            <Button onClick={() => setShowWorkOrderForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Work Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Order #</th>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-left font-medium">Equipment</th>
                    <th className="px-4 py-3 text-left font-medium">Problem</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkOrders.map((order: WorkOrder & { customer: Customer; equipment: Equipment; technician?: User }) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        {order.customer.firstName} {order.customer.lastName}
                      </td>
                      <td className="px-4 py-3">
                        {order.equipment.make} {order.equipment.modelNumber}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate">
                        {order.reportedProblem}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {format(new Date(order.createdAt!), "MMM dd, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditWorkOrder(order)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Order Form Modal */}
      {showWorkOrderForm && (
        <WorkOrderForm
          open={showWorkOrderForm}
          onOpenChange={handleCloseForm}
          shopId={selectedShop.id}
          workOrder={editingWorkOrder}
        />
      )}
    </div>
  );
}
