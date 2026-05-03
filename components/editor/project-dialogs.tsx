"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { MockProject, ProjectDialogMode } from "@/hooks/use-project-dialogs";

interface ProjectDialogsProps {
  activeDialog: ProjectDialogMode;
  targetProject: MockProject | null;
  createName: string;
  onCreateNameChange: (value: string) => void;
  createSlugPreview: string;
  renameName: string;
  onRenameNameChange: (value: string) => void;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitCreate: () => void;
  onSubmitRename: () => void;
  onSubmitDelete: () => void;
}

export function ProjectDialogs({
  activeDialog,
  targetProject,
  createName,
  onCreateNameChange,
  createSlugPreview,
  renameName,
  onRenameNameChange,
  loading,
  onOpenChange,
  onSubmitCreate,
  onSubmitRename,
  onSubmitDelete,
}: ProjectDialogsProps) {
  return (
    <>
      <Dialog
        open={activeDialog === "create"}
        onOpenChange={onOpenChange}
      >
        <DialogContent className="rounded-3xl sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>
              Choose a display name. You can change it later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="grid gap-2">
              <label
                htmlFor="project-create-name"
                className="text-sm font-medium text-foreground"
              >
                Project name
              </label>
              <Input
                id="project-create-name"
                value={createName}
                onChange={(e) => onCreateNameChange(e.target.value)}
                placeholder="e.g. Checkout service"
                disabled={loading}
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Slug preview:{" "}
              <span className="font-mono text-foreground/90">
                {createSlugPreview ? createSlugPreview : "—"}
              </span>
            </p>
          </div>
          <DialogFooter className="border-border bg-transparent sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onSubmitCreate}
              disabled={loading || !createName.trim()}
            >
              {loading ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "rename"} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-3xl sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Current name:{" "}
              <span className="font-medium text-foreground">
                {targetProject?.name ?? ""}
              </span>
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3 py-1"
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmitRename();
            }}
          >
            <div className="grid gap-2">
              <label
                htmlFor="project-rename-name"
                className="text-sm font-medium text-foreground"
              >
                Project name
              </label>
              <Input
                id="project-rename-name"
                value={renameName}
                onChange={(e) => onRenameNameChange(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <DialogFooter className="border-0 bg-transparent p-0 pt-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !renameName.trim()}
              >
                {loading ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "delete"} onOpenChange={onOpenChange}>
        <DialogContent className="rounded-3xl sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              This will remove{" "}
              <span className="font-medium text-foreground">
                {targetProject?.name ?? "this project"}
              </span>{" "}
              from your workspace. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-border bg-transparent sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void onSubmitDelete()}
              disabled={loading}
            >
              {loading ? "Deleting…" : "Delete project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
