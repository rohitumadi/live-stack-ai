"use client";

import { Bot, Share2 } from "lucide-react";
import { useState } from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { Button } from "@/components/ui/button";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import { cn } from "@/lib/utils";
import type { ProjectWithRole } from "@/types/project";

interface EditorWorkspaceShellProps {
  project: ProjectWithRole;
  initialOwnedProjects: ProjectWithRole[];
  initialSharedProjects: ProjectWithRole[];
}

export function EditorWorkspaceShell({
  project,
  initialOwnedProjects,
  initialSharedProjects,
}: EditorWorkspaceShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const dialogs = useProjectDialogs({
    initialOwnedProjects,
    initialSharedProjects,
  });

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      <EditorNavbar
        projectName={project.name}
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onShareProject={() => setShareOpen(true)}
        isAiSidebarOpen={aiSidebarOpen}
        onToggleAiSidebar={() => setAiSidebarOpen((prev) => !prev)}
      />
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        projectId={project.id}
        projectName={project.name}
        role={project.role}
      />
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentProjectId={project.id}
        ownedProjects={dialogs.ownedProjects}
        sharedProjects={dialogs.sharedProjects}
        onNewProject={dialogs.openCreate}
        onRenameProject={dialogs.openRename}
        onDeleteProject={dialogs.openDelete}
      />
      <ProjectDialogs
        activeDialog={dialogs.activeDialog}
        targetProject={dialogs.targetProject}
        createName={dialogs.createName}
        onCreateNameChange={dialogs.setCreateName}
        createSlugPreview={dialogs.createSlugPreview}
        renameName={dialogs.renameName}
        onRenameNameChange={dialogs.setRenameName}
        loading={dialogs.loading}
        error={dialogs.error}
        onOpenChange={(open) => {
          if (!open) dialogs.closeDialog();
        }}
        onSubmitCreate={() => void dialogs.submitCreate()}
        onSubmitRename={() => void dialogs.submitRename()}
        onSubmitDelete={() => void dialogs.submitDelete()}
      />
      <main className="flex h-full pt-12">
        <section className="relative min-w-0 flex-1 bg-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--muted)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="relative flex h-full items-center justify-center px-6 text-center">
            <div className="max-w-sm space-y-2">
              <h1 className="font-heading text-lg font-medium text-foreground">
                Canvas workspace
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Collaborative canvas will render here in the next feature unit.
              </p>
            </div>
          </div>
        </section>
        <aside
          className={cn(
            "hidden h-full w-80 shrink-0 border-l border-border bg-card/80 backdrop-blur md:flex",
            "transition-[width,opacity] duration-300",
            aiSidebarOpen ? "opacity-100" : "w-0 overflow-hidden opacity-0",
          )}
          aria-label="AI sidebar"
        >
          <div className="flex h-full w-80 shrink-0 flex-col">
            <div className="flex h-12 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Bot className="h-4 w-4 text-muted-foreground" />
                AI Assistant
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <p className="text-sm leading-6 text-muted-foreground">
                AI chat placeholder
              </p>
            </div>
          </div>
        </aside>
        <div className="fixed right-3 top-14 z-30 flex gap-2 md:hidden">
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => setShareOpen(true)}
            aria-label="Share project"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => setAiSidebarOpen((prev) => !prev)}
            aria-label={aiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
          >
            <Bot className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
