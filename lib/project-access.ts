import { auth, currentUser } from "@clerk/nextjs/server";
import type { ProjectModel } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";

export interface CurrentProjectIdentity {
  userId: string | null;
  primaryEmail: string | null;
}

export interface ProjectAccessResult {
  project: ProjectModel | null;
  role: "owner" | "collaborator" | null;
}

export async function getCurrentProjectIdentity(): Promise<CurrentProjectIdentity> {
  const { userId } = await auth();

  if (!userId) {
    return {
      userId: null,
      primaryEmail: null,
    };
  }

  const user = await currentUser();

  return {
    userId,
    primaryEmail: user?.primaryEmailAddress?.emailAddress ?? null,
  };
}

export async function checkProjectAccess(
  projectId: string,
  identity: CurrentProjectIdentity,
): Promise<ProjectAccessResult> {
  if (!identity.userId) {
    return {
      project: null,
      role: null,
    };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: {
        select: {
          collaboratorEmail: true,
        },
      },
    },
  });

  if (!project) {
    return {
      project: null,
      role: null,
    };
  }

  if (project.ownerId === identity.userId) {
    return {
      project,
      role: "owner",
    };
  }

  const primaryEmail = identity.primaryEmail?.toLowerCase();
  const isCollaborator =
    primaryEmail !== undefined &&
    project.collaborators.some(
      (collaborator) =>
        collaborator.collaboratorEmail.toLowerCase() === primaryEmail,
    );

  return {
    project,
    role: isCollaborator ? "collaborator" : null,
  };
}
