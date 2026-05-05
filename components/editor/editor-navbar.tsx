"use client";

import { UserButton } from "@clerk/nextjs";
import { Bot, PanelLeftClose, PanelLeftOpen, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  projectName?: string;
  onShareProject?: () => void;
  isAiSidebarOpen?: boolean;
  onToggleAiSidebar?: () => void;
  className?: string;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  onShareProject,
  isAiSidebarOpen,
  onToggleAiSidebar,
  className,
}: EditorNavbarProps) {
  const hasWorkspaceActions = projectName && onToggleAiSidebar;

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
      <div className="min-w-0 flex-1 px-2">
        {projectName ? (
          <p className="truncate text-center text-sm font-medium text-foreground">
            {projectName}
          </p>
        ) : null}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 px-3">
        {hasWorkspaceActions ? (
          <>
            {onShareProject ? (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={onShareProject}
                aria-label="Share project"
                className="hidden text-muted-foreground hover:text-foreground md:inline-flex"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={onToggleAiSidebar}
              aria-label={
                isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
              className="hidden text-muted-foreground hover:text-foreground md:inline-flex"
            >
              <Bot className="h-5 w-5" />
            </Button>
          </>
        ) : null}
        <UserButton />
      </div>
    </header>
  );
}
