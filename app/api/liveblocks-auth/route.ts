import { auth, currentUser } from "@clerk/nextjs/server";
import { checkProjectAccess } from "@/lib/project-access";
import {
  getCursorColorForUser,
  getLiveblocksClient,
} from "@/lib/liveblocks";

function parseRoomId(body: unknown) {
  if (body === null || typeof body !== "object") {
    return null;
  }

  const room = (body as { room?: unknown; projectId?: unknown }).room;
  const projectId = (body as { room?: unknown; projectId?: unknown })
    .projectId;
  const value = typeof room === "string" ? room : projectId;

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const roomId = parseRoomId(body);

  if (!roomId) {
    return Response.json({ error: "Missing room" }, { status: 400 });
  }

  const user = await currentUser();
  const access = await checkProjectAccess(roomId, {
    userId,
    primaryEmail: user?.primaryEmailAddress?.emailAddress ?? null,
  });

  if (!access.project || !access.role) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const liveblocks = getLiveblocksClient();

  await liveblocks.getOrCreateRoom(roomId, {
    defaultAccesses: [],
    metadata: {
      projectId: roomId,
    },
  });

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "Anonymous";
  const color = getCursorColorForUser(userId);
  const avatar = user?.imageUrl || undefined;
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name,
      displayName: name,
      avatar,
      avatarUrl: avatar,
      color,
      cursorColor: color,
    },
  });

  session.allow(roomId, session.FULL_ACCESS);

  const { body: responseBody, status } = await session.authorize();

  return new Response(responseBody, { status });
}
