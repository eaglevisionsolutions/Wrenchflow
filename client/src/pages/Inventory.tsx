import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Edit, 
  ShoppingCart,
  Package,
  AlertTriangle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import PartForm from "@/components/PartForm";
import type { Part } from "@shared/schema";

export default function Inventory() {
  const [selectedShop] = useLocalStorage("selectedShop", null);
  const [showPartForm, setShowPartForm] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  const { data: parts = [], isLoading } = useQuery({
    queryKey: [`/api/shops/${selectedShop?.id}/parts`],
    enabled: !!selectedShop?.id,
  });

  const filteredParts = parts.filter((part: Part) => {
    const matchesSearch = part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (stockFilter === "low") {
      return matchesSearch && part.quantityOnHand <= (part.minimumStockLevel || 0);
    }
    if (stockFilter === "out") {
      return matchesSearch && part.quantityOnHand === 0;
    }
    return matchesSearch;
  });

  const inventoryStats = {
    totalParts: parts.length,
    lowStock: parts.filter((p: Part) => p.quantityOnHand <= (p.minimumStockLevel || 0)).length,
    totalValue: parts.reduce((sum: number, part: Part) => sum + (part.quantityOnHand * parseFloat(part.costPrice)), 0).toFixed(2),
  };

  const handleEditPart = (part: Part) => {
    setEditingPart(part);
    setShowPartForm(true);
  };

  const handleCloseForm = () => {
    setShowPartForm(false);
    setEditingPart(null);
  };

  const getStockStatus = (part: Part) => {
    if (part.quantityOnHand === 0) return "Out of Stock";
    if (part.quantityOnHand <= (part.minimumStockLevel || 0)) return "Low Stock";
    return "In Stock";
  };

  const getStockStatusColor = (part: Part) => {
    if (part.quantityOnHand === 0) return "destructive";
    if (part.quantityOnHand <= (part.minimumStockLevel || 0)) return "secondary";
    return "default";
  };

  if (!selectedShop) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a shop to view inventory</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parts Inventory</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            Receive Shipment
          </Button>
          <Button onClick={() => setShowPartForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {inventoryStats.totalParts}
            </div>
            <p className="text-muted-foreground">Total Parts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {inventoryStats.lowStock}
            </div>
            <p className="text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${inventoryStats.totalValue}
            </div>
            <p className="text-muted-foreground">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Parts List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Parts Table */}
          {isLoading ? (
            <div className="text-center py-8">Loading inventory...</div>
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No parts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || stockFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first part"
                }
              </p>
              <Button onClick={() => setShowPartForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Part Name</th>
                    <th className="px-4 py-3 text-left font-medium">Part Number</th>
                    <th className="px-4 py-3 text-left font-medium">Bin Location</th>
                    <th className="px-4 py-3 text-left font-medium">Quantity</th>
                    <th className="px-4 py-3 text-left font-medium">Cost Price</th>
                    <th className="px-4 py-3 text-left font-medium">Sale Price</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((part: Part) => (
                    <tr key={part.id} className="border-b hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{part.partName}</td>
                      <td className="px-4 py-3">{part.partNumber}</td>
                      <td className="px-4 py-3">{part.binLocation || "N/A"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={part.quantityOnHand === 0 ? "destructive" : "secondary"}>
                            {part.quantityOnHand}
                          </Badge>
                          {part.minimumStockLevel && (
                            <span className="text-xs text-muted-foreground">
                              / min: {part.minimumStockLevel}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">${part.costPrice}</td>
                      <td className="px-4 py-3">${part.salePrice}</td>
                      <td className="px-4 py-3">
                        <Badge variant={getStockStatusColor(part)}>
                          {getStockStatus(part)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditPart(part)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Part Form Modal */}
      {showPartForm && (
        <PartForm
          open={showPartForm}
          onOpenChange={handleCloseForm}
          shopId={selectedShop.id}
          part={editingPart}
        />
      )}
    </div>
  );
}
