"use client";

import { useState } from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative h-screen bg-background">
      {/* Top navbar */}
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Floating sidebar overlay */}
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Editor canvas — starts below the navbar, never pushed by sidebar */}
      <main className="pt-12 h-full flex items-center justify-center text-muted-foreground text-sm select-none">
        Editor canvas — coming soon
      </main>
    </div>
  );
}
