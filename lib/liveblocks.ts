import { Liveblocks } from "@liveblocks/node";

const CURSOR_COLORS = [
  "#52A8FF",
  "#BF7AF0",
  "#FF990A",
  "#FF6166",
  "#F75F8F",
  "#62C073",
  "#0AC7B4",
  "#EDEDED",
] as const;

type LiveblocksGlobal = typeof globalThis & {
  liveblocksClient?: Liveblocks;
};

export function getCursorColorForUser(userId: string) {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  return CURSOR_COLORS[hash % CURSOR_COLORS.length];
}

export function getLiveblocksClient() {
  const globalForLiveblocks = globalThis as LiveblocksGlobal;

  if (globalForLiveblocks.liveblocksClient) {
    return globalForLiveblocks.liveblocksClient;
  }

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("Missing LIVEBLOCKS_SECRET_KEY environment variable");
  }

  const client = new Liveblocks({ secret });
  globalForLiveblocks.liveblocksClient = client;

  return client;
}
