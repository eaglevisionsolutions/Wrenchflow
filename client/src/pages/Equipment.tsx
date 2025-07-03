import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Eye, 
  Edit, 
  MoreVertical,
  Cog,
  Snowflake,
  Zap,
  Car
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import EquipmentForm from "@/components/EquipmentForm";
import type { Equipment, Customer } from "@shared/schema";
import { format } from "date-fns";

export default function Equipment() {
  const [selectedShop] = useLocalStorage("selectedShop", null);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: [`/api/shops/${selectedShop?.id}/equipment`],
    enabled: !!selectedShop?.id,
  });

  const getEquipmentIcon = (unitType: string) => {
    switch (unitType.toLowerCase()) {
      case 'snowblower':
        return <Snowflake className="h-8 w-8 text-primary" />;
      case 'chainsaw':
        return <Zap className="h-8 w-8 text-primary" />;
      case 'atv':
        return <Car className="h-8 w-8 text-primary" />;
      default:
        return <Cog className="h-8 w-8 text-primary" />;
    }
  };

  const handleEditEquipment = (item: Equipment) => {
    setEditingEquipment(item);
    setShowEquipmentForm(true);
  };

  const handleCloseForm = () => {
    setShowEquipmentForm(false);
    setEditingEquipment(null);
  };

  if (!selectedShop) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a shop to view equipment</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Equipment</h1>
        <Button onClick={() => setShowEquipmentForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Equipment Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading equipment...</div>
      ) : equipment.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Cog className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No equipment found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first piece of equipment
            </p>
            <Button onClick={() => setShowEquipmentForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="equipment-grid">
          {equipment.map((item: Equipment & { customer: Customer }) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getEquipmentIcon(item.unitType)}
                    <div>
                      <CardTitle className="text-lg">
                        {item.make} {item.modelNumber}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {item.unitType}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditEquipment(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Work Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Owner</p>
                  <p className="text-sm text-muted-foreground">
                    {item.customer.firstName} {item.customer.lastName}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Serial Number</p>
                  <p className="text-sm text-muted-foreground">{item.serialNumber}</p>
                </div>

                {item.purchaseDate && (
                  <div>
                    <p className="text-sm font-medium">Purchase Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.purchaseDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <Badge variant="secondary">Active</Badge>
                  <p className="text-xs text-muted-foreground">
                    Added {format(new Date(item.createdAt!), "MMM dd, yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Equipment Form Modal */}
      {showEquipmentForm && (
        <EquipmentForm
          open={showEquipmentForm}
          onOpenChange={handleCloseForm}
          shopId={selectedShop.id}
          equipment={editingEquipment}
        />
      )}
    </div>
  );
}
