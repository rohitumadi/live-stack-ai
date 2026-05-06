"use client";

import {
  Component,
  useCallback,
  useMemo,
  useRef,
  type DragEvent,
  type ErrorInfo,
  type ReactNode,
} from "react";
import {
  Circle,
  Database,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
  type LucideIcon,
} from "lucide-react";
import {
  Cursors,
  useLiveblocksFlow,
} from "@liveblocks/react-flow";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Handle,
  type NodeProps,
  type NodeTypes,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import {
  CANVAS_NODE_TYPE,
  NODE_COLORS,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeShape,
  type CanvasNodeSize,
  type ShapeDragPayload,
} from "@/types/canvas";

const SHAPE_DRAG_MIME_TYPE = "application/live-stack-shape";
const DEFAULT_NODE_COLOR = NODE_COLORS[0].color;

const SHAPE_DEFAULT_SIZES = {
  rectangle: { width: 168, height: 92 },
  diamond: { width: 148, height: 148 },
  circle: { width: 116, height: 116 },
  pill: { width: 168, height: 76 },
  cylinder: { width: 136, height: 112 },
  hexagon: { width: 148, height: 116 },
} satisfies Record<CanvasNodeShape, CanvasNodeSize>;

const SHAPE_TOOLS = [
  { shape: "rectangle", label: "Rectangle", icon: RectangleHorizontal },
  { shape: "diamond", label: "Diamond", icon: Diamond },
  { shape: "circle", label: "Circle", icon: Circle },
  { shape: "pill", label: "Pill", icon: Pill },
  { shape: "cylinder", label: "Cylinder", icon: Database },
  { shape: "hexagon", label: "Hexagon", icon: Hexagon },
] satisfies Array<{
  shape: CanvasNodeShape;
  label: string;
  icon: LucideIcon;
}>;

const shapeSet = new Set<CanvasNodeShape>(NODE_SHAPES);

interface BaseCanvasProps {
  roomId: string;
}

interface CanvasErrorBoundaryProps {
  children: ReactNode;
}

interface CanvasErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Liveblocks canvas connection failed", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <CanvasStateMessage
          title="Canvas connection failed"
          description="Refresh the workspace to reconnect to the collaborative room."
        />
      );
    }

    return this.props.children;
  }
}

export function BaseCanvas({ roomId }: BaseCanvasProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <CanvasErrorBoundary>
          <ClientSideSuspense
            fallback={
              <CanvasStateMessage
                title="Loading canvas"
                description="Connecting to the shared workspace."
              />
            }
          >
            <ReactFlowProvider>
              <SyncedCanvas />
            </ReactFlowProvider>
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

function SyncedCanvas() {
  const nodeCounterRef = useRef(0);
  const { screenToFlowPosition } = useReactFlow<CanvasNode, CanvasEdge>();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: {
        initial: [],
      },
      edges: {
        initial: [],
      },
    });

  const nodeTypes = useMemo(
    () =>
      ({
        [CANVAS_NODE_TYPE]: CanvasNodeRenderer,
      }) satisfies NodeTypes,
    []
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes(SHAPE_DRAG_MIME_TYPE)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const payload = parseShapeDragPayload(
        event.dataTransfer.getData(SHAPE_DRAG_MIME_TYPE)
      );

      if (!payload) {
        return;
      }

      nodeCounterRef.current += 1;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const node: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${nodeCounterRef.current}`,
        type: CANVAS_NODE_TYPE,
        position,
        width: payload.size.width,
        height: payload.size.height,
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR,
          shape: payload.shape,
        },
      };

      onNodesChange([{ type: "add", item: node }]);
    },
    [onNodesChange, screenToFlowPosition]
  );

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="var(--muted)"
        />
        <MiniMap
          pannable
          zoomable
          className="border border-border bg-card"
          maskColor="color-mix(in oklch, var(--background) 70%, transparent)"
          nodeColor="var(--muted)"
          nodeStrokeColor="var(--foreground)"
        />
        <Cursors />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}

function ShapePanel() {
  return (
    <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card/90 p-1.5 shadow-2xl shadow-background/60 backdrop-blur">
      {SHAPE_TOOLS.map(({ shape, label, icon: Icon }) => (
        <button
          key={shape}
          type="button"
          draggable
          className="flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground active:cursor-grabbing"
          aria-label={label}
          title={label}
          onDragStart={(event) => {
            const payload: ShapeDragPayload = {
              shape,
              size: SHAPE_DEFAULT_SIZES[shape],
            };

            event.dataTransfer.effectAllowed = "copy";
            event.dataTransfer.setData(
              SHAPE_DRAG_MIME_TYPE,
              JSON.stringify(payload)
            );
          }}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}

function CanvasNodeRenderer({
  data,
  width,
  height,
}: NodeProps<CanvasNode>) {
  const textColor = getNodeTextColor(data.color);

  return (
    <div
      className="group relative flex items-center justify-center rounded-xl border border-border px-4 text-center text-sm font-medium leading-5 shadow-lg shadow-background/40"
      style={{
        width: width ?? SHAPE_DEFAULT_SIZES[data.shape].width,
        height: height ?? SHAPE_DEFAULT_SIZES[data.shape].height,
        backgroundColor: data.color,
        color: textColor,
      }}
    >
      {data.label}
      <NodeHandle position={Position.Top} />
      <NodeHandle position={Position.Right} />
      <NodeHandle position={Position.Bottom} />
      <NodeHandle position={Position.Left} />
    </div>
  );
}

function NodeHandle({ position }: { position: Position }) {
  return (
    <Handle
      type="source"
      position={position}
      className="!h-2 !w-2 !border !border-background !bg-foreground opacity-0 transition group-hover:opacity-100"
    />
  );
}

function parseShapeDragPayload(value: string): ShapeDragPayload | null {
  if (!value) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(value);

    if (!isShapeDragPayload(payload)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function isShapeDragPayload(value: unknown): value is ShapeDragPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Partial<ShapeDragPayload>;

  return (
    isCanvasNodeShape(payload.shape) &&
    typeof payload.size?.width === "number" &&
    typeof payload.size.height === "number"
  );
}

function isCanvasNodeShape(value: unknown): value is CanvasNodeShape {
  return typeof value === "string" && shapeSet.has(value as CanvasNodeShape);
}

function getNodeTextColor(color: string) {
  return (
    NODE_COLORS.find((nodeColor) => nodeColor.color === color)?.textColor ??
    NODE_COLORS[0].textColor
  );
}

function CanvasStateMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center">
      <div className="max-w-sm space-y-2">
        <h1 className="font-heading text-lg font-medium text-foreground">
          {title}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
