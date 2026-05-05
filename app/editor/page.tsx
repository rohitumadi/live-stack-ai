import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { fetchUserProjects } from "@/lib/project-data";
import type { ProjectWithRole } from "@/types/project";
import { EditorHome } from "@/components/editor/editor-home";

export default async function EditorPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { ownedProjects, sharedProjects } = await fetchUserProjects();

  // Convert to ProjectWithRole format
  const owned: ProjectWithRole[] = ownedProjects.map((p) => ({
    ...p,
    role: "owner" as const,
  }));

  const shared: ProjectWithRole[] = sharedProjects.map((p) => ({
    ...p,
    role: "collaborator" as const,
  }));

  return (
    <EditorHome initialOwnedProjects={owned} initialSharedProjects={shared} />
  );
}
