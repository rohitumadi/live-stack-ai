"use client";

import { useCallback, useMemo, useState } from "react";
import { slugPreviewFromName } from "@/lib/project-slug";

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  /** Owner sees rename/delete; collaborators do not. */
  role: "owner" | "collaborator";
}

export type ProjectDialogMode = "create" | "rename" | "delete" | null;

const MOCK_DELAY_MS = 450;

const INITIAL_PROJECTS: MockProject[] = [
  {
    id: "mock-owned-1",
    name: "Payments API",
    slug: "payments-api",
    role: "owner",
  },
  {
    id: "mock-shared-1",
    name: "Design System",
    slug: "design-system",
    role: "collaborator",
  },
];

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState<MockProject[]>(INITIAL_PROJECTS);
  const [activeDialog, setActiveDialog] = useState<ProjectDialogMode>(null);
  const [targetProject, setTargetProject] = useState<MockProject | null>(
    null,
  );
  const [createName, setCreateName] = useState("");
  const [renameName, setRenameName] = useState("");
  const [loading, setLoading] = useState(false);

  const ownedProjects = useMemo(
    () => projects.filter((p) => p.role === "owner"),
    [projects],
  );
  const sharedProjects = useMemo(
    () => projects.filter((p) => p.role === "collaborator"),
    [projects],
  );

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
  }, []);

  const openCreate = useCallback(() => {
    setTargetProject(null);
    setCreateName("");
    setRenameName("");
    setActiveDialog("create");
  }, []);

  const openRename = useCallback((project: MockProject) => {
    setTargetProject(project);
    setRenameName(project.name);
    setCreateName("");
    setActiveDialog("rename");
  }, []);

  const openDelete = useCallback((project: MockProject) => {
    setTargetProject(project);
    setCreateName("");
    setRenameName("");
    setActiveDialog("delete");
  }, []);

  const submitCreate = useCallback(async () => {
    const name = createName.trim();
    if (!name || loading) return;
    const slug = slugPreviewFromName(name) || "project";
    setLoading(true);
    await delay(MOCK_DELAY_MS);
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `mock-${Date.now()}`;
    setProjects((prev) => [...prev, { id, name, slug, role: "owner" }]);
    setLoading(false);
    closeDialog();
  }, [createName, loading, closeDialog]);

  const submitRename = useCallback(async () => {
    const name = renameName.trim();
    if (!targetProject || !name || loading) return;
    const slug = slugPreviewFromName(name) || targetProject.slug;
    setLoading(true);
    await delay(MOCK_DELAY_MS);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === targetProject.id ? { ...p, name, slug } : p,
      ),
    );
    setLoading(false);
    closeDialog();
  }, [renameName, targetProject, loading, closeDialog]);

  const submitDelete = useCallback(async () => {
    if (!targetProject || loading) return;
    setLoading(true);
    await delay(MOCK_DELAY_MS);
    setProjects((prev) => prev.filter((p) => p.id !== targetProject.id));
    setLoading(false);
    closeDialog();
  }, [targetProject, loading, closeDialog]);

  return {
    projects,
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
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
  };
}
