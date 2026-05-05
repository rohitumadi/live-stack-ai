import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  enrichProjectCollaborators,
  parseCollaboratorEmail,
} from "@/lib/project-collaborators";
import { getCurrentProjectIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

async function getProjectForAccess(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      ownerId: true,
      collaborators: true,
    },
  });
}

function canViewCollaborators(
  project: Awaited<ReturnType<typeof getProjectForAccess>>,
  userId: string,
  primaryEmail: string | null,
) {
  if (!project) {
    return false;
  }

  if (project.ownerId === userId) {
    return true;
  }

  const email = primaryEmail?.toLowerCase();

  return Boolean(
    email &&
      project.collaborators.some(
        (collaborator) =>
          collaborator.collaboratorEmail.toLowerCase() === email,
      ),
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const identity = await getCurrentProjectIdentity();

  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await getProjectForAccess(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canViewCollaborators(project, identity.userId, identity.primaryEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    collaborators: await enrichProjectCollaborators(collaborators),
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = parseCollaboratorEmail(body);

  if (!email) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const collaborator = await prisma.projectCollaborator.upsert({
    where: {
      projectId_collaboratorEmail: {
        projectId,
        collaboratorEmail: email,
      },
    },
    create: {
      projectId,
      collaboratorEmail: email,
    },
    update: {},
  });

  const [enriched] = await enrichProjectCollaborators([collaborator]);

  return NextResponse.json({ collaborator: enriched }, { status: 201 });
}
