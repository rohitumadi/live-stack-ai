"use client";

import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProjectCollaborator } from "@/types/collaborator";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  role: "owner" | "collaborator";
}

interface CollaboratorsResponse {
  collaborators?: ProjectCollaborator[];
  error?: string;
}

interface CollaboratorResponse {
  collaborator?: ProjectCollaborator;
  error?: string;
}

function getInitials(collaborator: ProjectCollaborator) {
  const source = collaborator.displayName ?? collaborator.email;
  const parts = source.split(/[.@\s_-]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "?";
}

async function readError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: unknown };
    return typeof body.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  role,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isOwner = role === "owner";
  const projectLink = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/editor/${projectId}`;
  }, [projectId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let ignore = false;

    async function loadCollaborators() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators`,
        );
        const body = (await response.json()) as CollaboratorsResponse;

        if (!response.ok) {
          throw new Error(body.error ?? "Unable to load collaborators");
        }

        if (!ignore) {
          setCollaborators(body.collaborators ?? []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load collaborators",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadCollaborators();

    return () => {
      ignore = true;
    };
  }, [open, projectId]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1600);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function inviteCollaborator() {
    const nextEmail = email.trim().toLowerCase();

    if (!nextEmail) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail }),
      });
      const body = (await response.json()) as CollaboratorResponse;

      if (!response.ok || !body.collaborator) {
        throw new Error(body.error ?? "Unable to invite collaborator");
      }

      const invitedCollaborator = body.collaborator;

      setCollaborators((current) => {
        const withoutDuplicate = current.filter(
          (collaborator) => collaborator.id !== invitedCollaborator.id,
        );

        return [...withoutDuplicate, invitedCollaborator].sort(
          (first, second) => first.createdAt.localeCompare(second.createdAt),
        );
      });
      setEmail("");
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "Unable to invite collaborator",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCollaborator(collaboratorId: string) {
    setRemovingId(collaboratorId);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators/${collaboratorId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error(
          await readError(response, "Unable to remove collaborator"),
        );
      }

      setCollaborators((current) =>
        current.filter((collaborator) => collaborator.id !== collaboratorId),
      );
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove collaborator",
      );
    } finally {
      setRemovingId(null);
    }
  }

  async function copyProjectLink() {
    if (!projectLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(projectLink);
      setCopied(true);
    } catch {
      setError("Unable to copy link to clipboard");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            {isOwner
              ? `Invite collaborators to ${projectName}.`
              : `People with access to ${projectName}.`}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {isOwner ? (
          <form
            className="grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void inviteCollaborator();
            }}
          >
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="share-collaborator-email"
            >
              Invite by email
            </label>
            <div className="flex gap-2">
              <Input
                id="share-collaborator-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@example.com"
                disabled={submitting}
              />
              <Button
                type="submit"
                disabled={submitting || !email.trim()}
                className="shrink-0"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Invite
              </Button>
            </div>
          </form>
        ) : null}

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-foreground">
              Collaborators
            </h3>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>

          <div className="max-h-64 overflow-y-auto rounded-2xl border border-border">
            {collaborators.length > 0 ? (
              <div className="divide-y divide-border">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex min-h-14 items-center gap-3 px-3 py-2"
                  >
                    <Avatar>
                      {collaborator.avatarUrl ? (
                        <AvatarImage src={collaborator.avatarUrl} alt="" />
                      ) : null}
                      <AvatarFallback>
                        {getInitials(collaborator)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {collaborator.displayName ?? collaborator.email}
                      </p>
                      {collaborator.displayName ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {collaborator.email}
                        </p>
                      ) : null}
                    </div>
                    {isOwner ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${collaborator.email}`}
                        disabled={removingId === collaborator.id}
                        onClick={() => void removeCollaborator(collaborator.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        {removingId === collaborator.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-20 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                {loading ? "Loading collaborators..." : "No collaborators yet."}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-border bg-transparent sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => void copyProjectLink()}
            disabled={!projectLink}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
