"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { slugPreviewFromName } from "@/lib/project-slug";
import type { ProjectWithRole } from "@/types/project";

export type ProjectDialogMode = "create" | "rename" | "delete" | null;

interface UseProjectDialogsProps {
  initialOwnedProjects: ProjectWithRole[];
  initialSharedProjects: ProjectWithRole[];
}

export function useProjectDialogs({
  initialOwnedProjects,
  initialSharedProjects,
}: UseProjectDialogsProps) {
  const router = useRouter();
  const [projects, setProjects] = useState({
    owned: initialOwnedProjects,
    shared: initialSharedProjects,
  });
  const [activeDialog, setActiveDialog] = useState<ProjectDialogMode>(null);
  const [targetProject, setTargetProject] = useState<ProjectWithRole | null>(
    null,
  );
  const [createName, setCreateName] = useState("");
  const [renameName, setRenameName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ownedProjects = useMemo(() => projects.owned, [projects.owned]);
  const sharedProjects = useMemo(() => projects.shared, [projects.shared]);

  const createSlugPreview = useMemo(
    () => slugPreviewFromName(createName),
    [createName],
  );

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setTargetProject(null);
    setCreateName("");
    setRenameName("");
    setLoading(false);
    setError(null);
  }, []);

  const openCreate = useCallback(() => {
    setTargetProject(null);
    setCreateName("");
    setRenameName("");
    setError(null);
    setActiveDialog("create");
  }, []);

  const openRename = useCallback((project: ProjectWithRole) => {
    setTargetProject(project);
    setRenameName(project.name);
    setCreateName("");
    setError(null);
    setActiveDialog("rename");
  }, []);

  const openDelete = useCallback((project: ProjectWithRole) => {
    setTargetProject(project);
    setCreateName("");
    setRenameName("");
    setError(null);
    setActiveDialog("delete");
  }, []);

  const submitCreate = useCallback(async () => {
    const name = createName.trim();
    if (!name || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Failed to create project (${response.status})`,
        );
      }

      const data = await response.json();
      const newProject: ProjectWithRole = {
        ...data.project,
        role: "owner",
      };

      setProjects((prev) => ({
        ...prev,
        owned: [newProject, ...prev.owned],
      }));

      closeDialog();

      // Navigate to the new workspace
      router.push(`/editor/${newProject.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create project";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [createName, loading, closeDialog, router]);

  const submitRename = useCallback(async () => {
    const name = renameName.trim();
    if (!targetProject || !name || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${targetProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Failed to rename project (${response.status})`,
        );
      }

      const data = await response.json();
      const updated = data.project;

      setProjects((prev) => ({
        ...prev,
        owned: prev.owned.map((p) =>
          p.id === updated.id ? { ...updated, role: "owner" } : p,
        ),
      }));

      closeDialog();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to rename project";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [renameName, targetProject, loading, closeDialog, router]);

  const submitDelete = useCallback(async () => {
    if (!targetProject || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${targetProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Failed to delete project (${response.status})`,
        );
      }

      setProjects((prev) => ({
        ...prev,
        owned: prev.owned.filter((p) => p.id !== targetProject.id),
      }));

      closeDialog();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete project";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [targetProject, loading, closeDialog, router]);

  return {
    projects: {
      owned: ownedProjects,
      shared: sharedProjects,
    },
    ownedProjects,
    sharedProjects,
    activeDialog,
    targetProject,
    createName,
    setCreateName,
    renameName,
    setRenameName,
    createSlugPreview,
    loading,
    error,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
  };
}
