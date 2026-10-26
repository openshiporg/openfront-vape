"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { DataTable, StatusWord, Td, Th, Tr } from "../../../components/vape-ui";
import { POPULAR_REGIONS } from "../../constants/popular-regions";
import { createPopularRegion } from "../../actions/popular-regions";

interface PopularRegionsDrawerProps {
  open: boolean;
  onClose: () => void;
  onRegionCreated: () => void;
}

export function PopularRegionsDrawer({ 
  open, 
  onClose, 
  onRegionCreated 
}: PopularRegionsDrawerProps) {
  const [creatingRegion, setCreatingRegion] = useState<string | null>(null);
  const [createdRegions, setCreatedRegions] = useState<Set<string>>(new Set());

  const handleCreateRegion = async (templateName: string) => {
    setCreatingRegion(templateName);
    
    try {
      const result = await createPopularRegion(templateName);
      
      if (result.success) {
        toast.success(result.data?.message || `Successfully created ${templateName} region`);
        
        setCreatedRegions(prev => new Set([...prev, templateName]));
        onRegionCreated();
      } else {
        toast.error(result.error || "Failed to create region");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create region");
    } finally {
      setCreatingRegion(null);
    }
  };

  // Reset state when drawer closes
  useEffect(() => {
    if (!open) {
      setCreatedRegions(new Set());
      setCreatingRegion(null);
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-semibold tracking-tight">Popular Regions</DrawerTitle>
              <DrawerDescription className="sr-only">Popular regions</DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="size-10 rounded-[4px]" aria-label="Close">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4 pb-6 md:px-6">
          <DataTable aria-label="Popular regions">
            <thead>
              <tr>
                <Th>Region</Th>
                <Th priority={2}>Countries</Th>
                <Th priority={2} align="right">Currencies</Th>
                <Th priority={2} align="right">Tax</Th>
                <Th priority={3}>Default currency</Th>
                <Th align="right"><span className="sr-only">Create</span></Th>
              </tr>
            </thead>
            <tbody>
              {POPULAR_REGIONS.map((template) => {
                const isCreating = creatingRegion === template.name;
                const isCreated = createdRegions.has(template.name);

                return (
                  <Tr key={template.name}>
                    <Td className="max-w-[18rem]">
                      <div className="font-medium text-foreground">{template.name}</div>
                      {template.description && (
                        <div className="mt-0.5 line-clamp-2 text-[12px] text-muted-foreground">{template.description}</div>
                      )}
                      {isCreated && (
                        <div className="mt-1">
                          <StatusWord tone="ok">Created</StatusWord>
                        </div>
                      )}
                    </Td>
                    <Td priority={2} className="whitespace-nowrap">
                      <span className="tabular-nums">{template.countries.length}</span>
                      <span className="ml-2 font-mono text-[12px] uppercase text-muted-foreground">
                        {template.countries.slice(0, 4).map((country) => country.iso2).join(" ")}
                        {template.countries.length > 4 && ` +${template.countries.length - 4}`}
                      </span>
                    </Td>
                    <Td priority={2} align="right">{template.currencies.length}</Td>
                    <Td priority={2} align="right">{template.taxRate}%</Td>
                    <Td priority={3} className="font-mono">{template.defaultCurrency}</Td>
                    <Td align="right" className="w-px whitespace-nowrap py-1">
                      <Button
                        onClick={() => handleCreateRegion(template.name)}
                        disabled={isCreating || isCreated}
                        size="sm"
                        className={`h-10 shrink-0 rounded-[4px] px-3 sm:h-8 ${isCreated ? "bg-muted text-foreground hover:bg-muted" : ""}`}
                        variant={isCreated ? "secondary" : "default"}
                      >
                        {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isCreated ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Created
                          </>
                        ) : isCreating ? (
                          "Creating..."
                        ) : (
                          "Create Region"
                        )}
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </DataTable>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}