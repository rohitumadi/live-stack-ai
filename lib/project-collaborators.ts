import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/backend";
import type { ProjectCollaboratorModel } from "@/generated/prisma/models";
import type { ProjectCollaborator } from "@/types/collaborator";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getUserDisplayName(user: User) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return name || user.username || null;
}

function mapUsersByEmail(users: User[]) {
  const usersByEmail = new Map<string, User>();

  for (const user of users) {
    for (const emailAddress of user.emailAddresses) {
      usersByEmail.set(normalizeEmail(emailAddress.emailAddress), user);
    }
  }

  return usersByEmail;
}

export async function enrichProjectCollaborators(
  collaborators: ProjectCollaboratorModel[],
): Promise<ProjectCollaborator[]> {
  const emails = collaborators.map((collaborator) =>
    normalizeEmail(collaborator.collaboratorEmail),
  );

  let usersByEmail = new Map<string, User>();

  if (emails.length > 0) {
    const client = await clerkClient();
    const users = await client.users.getUserList({
      emailAddress: emails,
      limit: emails.length,
    });

    usersByEmail = mapUsersByEmail(users.data);
  }

  return collaborators.map((collaborator) => {
    const email = normalizeEmail(collaborator.collaboratorEmail);
    const user = usersByEmail.get(email);

    return {
      id: collaborator.id,
      email,
      displayName: user ? getUserDisplayName(user) : null,
      avatarUrl: user?.imageUrl ?? null,
      createdAt: collaborator.createdAt.toISOString(),
    };
  });
}

export function parseCollaboratorEmail(body: unknown) {
  if (body === null || body === undefined || typeof body !== "object") {
    return null;
  }
  const emailRaw = (body as { email?: unknown }).email;
  const email = typeof emailRaw === "string" ? normalizeEmail(emailRaw) : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }

  return email;
}
