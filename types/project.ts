export interface Project {
  id: string;
  name: string;
  ownerId: string;
  description: string | null;
  status: string;
  canvasJsonPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectWithRole extends Project {
  role: "owner" | "collaborator";
}
