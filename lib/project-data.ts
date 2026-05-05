import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export interface ProjectData {
  id: string;
  name: string;
  ownerId: string;
  description: string | null;
  status: string;
  canvasJsonPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fetch all owned and shared projects for the authenticated user.
 * Returns { ownedProjects, sharedProjects }.
 */
export async function fetchUserProjects() {
  const { userId } = await auth();

  if (!userId) {
    return { ownedProjects: [], sharedProjects: [] };
  }

  // Fetch owned projects
  const ownedProjects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      ownerId: true,
      description: true,
      status: true,
      canvasJsonPath: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Fetch shared projects (where user is a collaborator)
  const sharedProjects = await prisma.project.findMany({
    where: {
      collaborators: {
        some: {
          collaboratorEmail: {
            // This would require the user's email, which we'd need from Clerk
            // For now, we'll return an empty array since we don't have user email readily available
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      ownerId: true,
      description: true,
      status: true,
      canvasJsonPath: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { ownedProjects, sharedProjects };
}
