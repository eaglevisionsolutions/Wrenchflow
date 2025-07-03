import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Users, Package, ClipboardList, BarChart3, Shield } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Wrench className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">WrenchFlow</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Complete service shop management solution for small engine repair businesses. 
            Streamline your operations, track equipment, manage inventory, and grow your business.
          </p>
          <Button onClick={handleLogin} size="lg" className="px-8 py-3 text-lg">
            Get Started Today
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                Complete customer database with contact information, service history, and equipment tracking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <ClipboardList className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Work Orders</CardTitle>
              <CardDescription>
                Digital work order management with status tracking, parts integration, and technician assignment.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Package className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Parts Inventory</CardTitle>
              <CardDescription>
                Real-time inventory tracking with low stock alerts, bin locations, and vendor management.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                Comprehensive reporting on sales, service metrics, customer activity, and business performance.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Multi-Tenant Security</CardTitle>
              <CardDescription>
                Secure, isolated data for each shop with role-based access control and data protection.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wrench className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Equipment Tracking</CardTitle>
              <CardDescription>
                Track customer equipment with make, model, serial numbers, and complete service history.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Built for Small Engine Repair Shops
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50%</div>
              <p className="text-gray-600 dark:text-gray-300">Faster work order processing</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">30%</div>
              <p className="text-gray-600 dark:text-gray-300">Reduction in lost parts</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-gray-600 dark:text-gray-300">Access from any device</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Shop?</h2>
            <p className="text-lg mb-6 opacity-90">
              Join hundreds of repair shops already using WrenchFlow to streamline their operations.
            </p>
            <Button 
              onClick={handleLogin} 
              variant="secondary" 
              size="lg"
              className="px-8 py-3 text-lg"
            >
              Start Your Free Trial
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
