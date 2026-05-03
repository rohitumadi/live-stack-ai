"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  className?: string;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  className,
}: EditorNavbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 h-12 flex items-center",
        "bg-card border-b border-border",
        className,
      )}
    >
      {/* Left section — sidebar toggle */}
      <div className="flex items-center px-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="text-muted-foreground hover:text-foreground"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Center section */}
      <div className="flex-1 flex items-center justify-center" />

      {/* Right section — reserved for future actions */}
      <div className="flex items-center px-3" />
    </header>
  );
}
