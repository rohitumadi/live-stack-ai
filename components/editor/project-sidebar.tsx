"use client";

import { MoreHorizontal, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { ProjectWithRole } from "@/types/project";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  ownedProjects: ProjectWithRole[];
  sharedProjects: ProjectWithRole[];
  onNewProject: () => void;
  onRenameProject: (project: ProjectWithRole) => void;
  onDeleteProject: (project: ProjectWithRole) => void;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  onNewProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  return (
    <>
      {/* Backdrop: closes sidebar on outside tap; stronger scrim + blur on mobile */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          "max-md:bg-black/40 max-md:supports-[backdrop-filter]:backdrop-blur-sm",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
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
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide text-foreground">
            Projects
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
            className="-mr-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="my-projects"
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="mx-4 mt-3 w-[calc(100%-2rem)] shrink-0">
            <TabsTrigger value="my-projects" className="flex-1">
              My Projects
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex-1">
              Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="my-projects"
            className="flex-1 overflow-y-auto px-4 py-6"
          >
            {ownedProjects.length === 0 ? (
              <EmptyPlaceholder message="No projects yet" />
            ) : (
              <ul className="flex flex-col gap-1">
                {ownedProjects.map((project) => (
                  <li key={project.id}>
                    <ProjectRow
                      project={project}
                      showActions
                      onRename={() => onRenameProject(project)}
                      onDelete={() => onDeleteProject(project)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent
            value="shared"
            className="flex-1 overflow-y-auto px-4 py-6"
          >
            {sharedProjects.length === 0 ? (
              <EmptyPlaceholder message="Nothing shared with you yet" />
            ) : (
              <ul className="flex flex-col gap-1">
                {sharedProjects.map((project) => (
                  <li key={project.id}>
                    <ProjectRow project={project} showActions={false} />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer — New Project */}
        <div className="shrink-0 border-t border-border px-4 py-3">
          <Button className="w-full gap-2" type="button" onClick={onNewProject}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}

function EmptyPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ProjectRow({
  project,
  showActions,
  onRename,
  onDelete,
}: {
  project: ProjectWithRole;
  showActions: boolean;
  onRename?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Link
      href={`/editor/${project.id}`}
      className="block rounded-xl transition-colors hover:bg-accent/50"
    >
      <div className="flex items-center gap-1 px-2 py-2 text-left">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {project.name}
          </p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {project.id}
          </p>
        </div>
        {showActions && onRename && onDelete ? (
          <div onClick={(e) => e.preventDefault()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-xs" }),
                  "shrink-0 text-muted-foreground hover:text-foreground",
                )}
                aria-label={`Actions for ${project.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36">
                <DropdownMenuItem onClick={onRename}>Rename</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
