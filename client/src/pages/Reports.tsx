import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, Clock } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function Reports() {
  const [selectedShop] = useLocalStorage("selectedShop", null);

  const { data: metrics } = useQuery({
    queryKey: [`/api/shops/${selectedShop?.id}/metrics`],
    enabled: !!selectedShop?.id,
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: [`/api/shops/${selectedShop?.id}/work-orders`],
    enabled: !!selectedShop?.id,
  });

  // Calculate reports data
  const completedOrders = workOrders.filter((w: any) => w.status === "completed");
  const avgTurnaround = completedOrders.length > 0 
    ? Math.round(completedOrders.reduce((acc: number, order: any) => {
        const created = new Date(order.createdAt);
        const updated = new Date(order.updatedAt);
        return acc + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / completedOrders.length * 10) / 10
    : 0;

  // Group customers by revenue
  const customerRevenue = workOrders.reduce((acc: any, order: any) => {
    const customerName = `${order.customer.firstName} ${order.customer.lastName}`;
    acc[customerName] = (acc[customerName] || 0) + parseFloat(order.totalCost || 0);
    return acc;
  }, {});

  const topCustomers = Object.entries(customerRevenue)
    .map(([name, revenue]) => ({ name, revenue: revenue as number }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  if (!selectedShop) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a shop to view reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metrics?.monthlyRevenue || "0"}
            </div>
            <p className="text-xs text-muted-foreground">This Month</p>
            <div className="mt-2 text-sm">
              <span className="text-green-600">+12%</span>
              <span className="text-muted-foreground"> vs Last Month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Work Order Statistics</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {completedOrders.length}
            </div>
            <p className="text-xs text-muted-foreground">Completed This Month</p>
            <div className="mt-2 text-sm">
              <span className="text-blue-600">{avgTurnaround} days</span>
              <span className="text-muted-foreground"> avg turnaround</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No customer data available</p>
            ) : (
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                    <span className="font-bold text-green-600">
                      ${customer.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Work Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: "open", label: "Open", count: workOrders.filter((w: any) => w.status === "open").length },
                { status: "in_progress", label: "In Progress", count: workOrders.filter((w: any) => w.status === "in_progress").length },
                { status: "ready_for_pickup", label: "Ready for Pickup", count: workOrders.filter((w: any) => w.status === "ready_for_pickup").length },
                { status: "completed", label: "Completed", count: workOrders.filter((w: any) => w.status === "completed").length },
              ].map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`status-${item.status}`}>
                      {item.label}
                    </Badge>
                  </div>
                  <span className="font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {workOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No work orders available</p>
            ) : (
              <div className="space-y-3">
                {workOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customer.firstName} {order.customer.lastName} - {order.equipment.make} {order.equipment.modelNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`status-${order.status}`}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm font-bold text-green-600">
                        ${order.totalCost || "0.00"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
