import { prisma } from "@/lib/prisma";
import { getCurrentProjectIdentity } from "@/lib/project-access";

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
  const { userId, primaryEmail } = await getCurrentProjectIdentity();
  const collaboratorEmail = primaryEmail;

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

  const sharedProjects = collaboratorEmail
    ? await prisma.project.findMany({
        where: {
          ownerId: { not: userId },
          collaborators: {
            some: {
              collaboratorEmail: {
                equals: collaboratorEmail,
                mode: "insensitive",
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
      })
    : [];

  return { ownedProjects, sharedProjects };
}
