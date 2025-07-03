import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPartSchema, type Part } from "@shared/schema";
import { z } from "zod";

const formSchema = insertPartSchema.extend({
  costPrice: z.string().min(1, "Cost price is required"),
  salePrice: z.string().min(1, "Sale price is required"),
  quantityOnHand: z.string().min(0, "Quantity must be 0 or greater"),
  minimumStockLevel: z.string().optional(),
});

interface PartFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string;
  part?: Part | null;
}

export default function PartForm({ open, onOpenChange, shopId, part }: PartFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partName: part?.partName || "",
      partNumber: part?.partNumber || "",
      description: part?.description || "",
      costPrice: part?.costPrice || "",
      salePrice: part?.salePrice || "",
      quantityOnHand: part?.quantityOnHand?.toString() || "0",
      minimumStockLevel: part?.minimumStockLevel?.toString() || "",
      binLocation: part?.binLocation || "",
      isBulk: part?.isBulk || false,
      bulkUnitMeasure: part?.bulkUnitMeasure || "",
    },
  });

  const isBulk = form.watch("isBulk");

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const submitData = {
        ...data,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        quantityOnHand: parseInt(data.quantityOnHand),
        minimumStockLevel: data.minimumStockLevel ? parseInt(data.minimumStockLevel) : null,
      };
      const response = await apiRequest("POST", `/api/shops/${shopId}/parts`, submitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/shops/${shopId}/parts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/shops/${shopId}/parts/low-stock`] });
      queryClient.invalidateQueries({ queryKey: [`/api/shops/${shopId}/metrics`] });
      toast({
        title: "Success",
        description: "Part created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create part",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const submitData = {
        ...data,
        costPrice: data.costPrice,
        salePrice: data.salePrice,
        quantityOnHand: parseInt(data.quantityOnHand),
        minimumStockLevel: data.minimumStockLevel ? parseInt(data.minimumStockLevel) : null,
      };
      const response = await apiRequest("PUT", `/api/shops/${shopId}/parts/${part!.id}`, submitData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/shops/${shopId}/parts`] });
      queryClient.invalidateQueries({ queryKey: [`/api/shops/${shopId}/parts/low-stock`] });
      queryClient.invalidateQueries({ queryKey: [`/api/shops/${shopId}/metrics`] });
      toast({
        title: "Success",
        description: "Part updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update part",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (part) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const bulkUnits = [
    "Litre",
    "ml", 
    "Gallon",
    "Quart",
    "Ounce",
    "Pound"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {part ? "Edit Part" : "Add New Part"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="partName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantityOnHand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity on Hand *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimumStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stock Level</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="binLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bin Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., A-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isBulk"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Bulk Item (fluids, oils, etc.)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {isBulk && (
              <FormField
                control={form.control}
                name="bulkUnitMeasure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bulk Unit of Measure</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bulkUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : part ? "Update Part" : "Save Part"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
