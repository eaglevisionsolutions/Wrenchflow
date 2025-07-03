import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardList, 
  DollarSign, 
  Users, 
  AlertTriangle,
  Plus,
  Eye,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import WorkOrderForm from "@/components/WorkOrderForm";
import CustomerForm from "@/components/CustomerForm";
import { format } from "date-fns";

export default function Dashboard() {
  const [selectedShop] = useLocalStorage("selectedShop", null);
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: [`/api/shops/${selectedShop?.id}/metrics`],
    enabled: !!selectedShop?.id,
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: [`/api/shops/${selectedShop?.id}/work-orders`],
    enabled: !!selectedShop?.id,
  });

  const { data: lowStockParts = [] } = useQuery({
    queryKey: [`/api/shops/${selectedShop?.id}/parts/low-stock`],
    enabled: !!selectedShop?.id,
  });

  const recentWorkOrders = workOrders.slice(0, 5);

  if (!selectedShop) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a shop to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowWorkOrderForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
          <Button variant="outline" onClick={() => setShowCustomerForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {metricsLoading ? "..." : metrics?.activeWorkOrders || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metricsLoading ? "..." : metrics?.monthlyRevenue || "0"}
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metricsLoading ? "..." : metrics?.totalCustomers || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {metricsLoading ? "..." : metrics?.lowStockItems || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Work Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Work Orders</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentWorkOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No work orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentWorkOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customer.firstName} {order.customer.lastName} - {order.equipment.make} {order.equipment.modelNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`status-${order.status}`}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                onClick={() => setShowWorkOrderForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Work Order
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowCustomerForm(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Parts running low on inventory</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockParts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No low stock items</p>
              ) : (
                <div className="space-y-3">
                  {lowStockParts.slice(0, 5).map((part) => (
                    <div key={part.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">{part.partName}</div>
                        <div className="text-xs text-muted-foreground">
                          Bin: {part.binLocation || "N/A"}
                        </div>
                      </div>
                      <Badge variant={part.quantityOnHand === 0 ? "destructive" : "secondary"}>
                        {part.quantityOnHand} left
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showWorkOrderForm && (
        <WorkOrderForm
          open={showWorkOrderForm}
          onOpenChange={setShowWorkOrderForm}
          shopId={selectedShop.id}
        />
      )}

      {showCustomerForm && (
        <CustomerForm
          open={showCustomerForm}
          onOpenChange={setShowCustomerForm}
          shopId={selectedShop.id}
        />
      )}
    </div>
  );
}
