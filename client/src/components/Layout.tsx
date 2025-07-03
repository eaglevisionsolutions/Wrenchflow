import { ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "./Sidebar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [selectedShop, setSelectedShop] = useLocalStorage("selectedShop", null);
  const { toast } = useToast();

  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ["/api/shops"],
    retry: false,
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  // Auto-select first shop if none selected
  useEffect(() => {
    if (!selectedShop && shops.length > 0) {
      setSelectedShop(shops[0]);
    }
  }, [shops, selectedShop, setSelectedShop]);

  if (shopsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        shops={shops} 
        selectedShop={selectedShop} 
        onShopSelect={setSelectedShop} 
      />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
