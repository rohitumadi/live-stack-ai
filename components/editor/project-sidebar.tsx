"use client";

import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <>
      {/* Overlay backdrop — clicking it closes the sidebar */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      />

      {/* Sidebar panel — slides in from left, floats above canvas */}
      <aside
        role="dialog"
        aria-label="Project sidebar"
        aria-modal="true"
        className={cn(
          "fixed top-12 left-0 bottom-0 z-50 w-72",
          "flex flex-col",
          "bg-card border-r border-border",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold tracking-wide text-foreground">
            Projects
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
            className="text-muted-foreground hover:text-foreground -mr-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="my-projects"
          className="flex flex-col flex-1 min-h-0"
        >
          <TabsList className="mx-4 mt-3 w-[calc(100%-2rem)] shrink-0">
            <TabsTrigger value="my-projects" className="flex-1">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">
              Shared
            </TabsTrigger>
          </TabsList>

          {/* My Projects tab */}
          <TabsContent
            value="my-projects"
            className="flex-1 overflow-y-auto px-4 py-6"
          >
            <EmptyPlaceholder message="No projects yet" />
          </TabsContent>

          {/* Shared tab */}
          <TabsContent
            value="shared"
            className="flex-1 overflow-y-auto px-4 py-6"
          >
            <EmptyPlaceholder message="Nothing shared with you yet" />
          </TabsContent>
        </Tabs>

        {/* Footer — New Project button */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <Button className="w-full gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Internal helper                                                      */
/* ------------------------------------------------------------------ */

function EmptyPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
