"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { Button } from "@/components/ui/button";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import type { ProjectWithRole } from "@/types/project";

interface EditorHomeProps {
  initialOwnedProjects: ProjectWithRole[];
  initialSharedProjects: ProjectWithRole[];
}

export function EditorHome({
  initialOwnedProjects,
  initialSharedProjects,
}: EditorHomeProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dialogs = useProjectDialogs({
    initialOwnedProjects,
    initialSharedProjects,
  });

  return (
    <div className="relative h-screen bg-background">
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
      <main className="flex h-full flex-col items-center justify-center px-6 pb-12 pt-12 select-none">
        <div className="flex max-w-lg flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-xl font-medium tracking-tight text-foreground">
            Create a project or open an existing one
          </h1>
          <p className="text-sm text-muted-foreground">
            Start by creating a new project or select one from your sidebar.
          </p>
          <Button onClick={dialogs.openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </main>
    </div>
  );
}
