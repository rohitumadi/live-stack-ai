import { redirect } from "next/navigation";
import { AccessDenied } from "@/components/editor/access-denied";
import { EditorWorkspaceShell } from "@/components/editor/editor-workspace-shell";
import { fetchUserProjects } from "@/lib/project-data";
import {
  checkProjectAccess,
  getCurrentProjectIdentity,
} from "@/lib/project-access";
import type { ProjectWithRole } from "@/types/project";

interface WorkspacePageProps {
  params: Promise<{ roomId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const identity = await getCurrentProjectIdentity();

  if (!identity.userId) {
    redirect("/sign-in");
  }

  const { roomId } = await params;
  const access = await checkProjectAccess(roomId, identity);

  if (!access.project || !access.role) {
    return <AccessDenied />;
  }

  const { ownedProjects, sharedProjects } = await fetchUserProjects();
  const owned: ProjectWithRole[] = ownedProjects.map((project) => ({
    ...project,
    role: "owner" as const,
  }));
  const shared: ProjectWithRole[] = sharedProjects.map((project) => ({
    ...project,
    role: "collaborator" as const,
  }));
  const project: ProjectWithRole = {
    ...access.project,
    role: access.role,
  };

  return (
    <EditorWorkspaceShell
      project={project}
      initialOwnedProjects={owned}
      initialSharedProjects={shared}
    />
  );
}
