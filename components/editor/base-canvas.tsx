"use client";

import {
  Component,
  useCallback,
  useMemo,
  useRef,
  useState,
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
import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow";
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
  NodeResizer,
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

const MIN_NODE_SIZE = { width: 60, height: 40 };

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
    [],
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
        event.dataTransfer.getData(SHAPE_DRAG_MIME_TYPE),
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
    [onNodesChange, screenToFlowPosition],
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
              JSON.stringify(payload),
            );

            const preview = document.createElement("div");
            preview.style.width = `${SHAPE_DEFAULT_SIZES[shape].width}px`;
            preview.style.height = `${SHAPE_DEFAULT_SIZES[shape].height}px`;
            preview.style.position = "fixed";
            preview.style.left = "-9999px";
            preview.style.top = "-9999px";
            preview.style.pointerEvents = "none";
            preview.style.boxSizing = "border-box";

            const svgShapes = ["diamond", "hexagon", "cylinder"];
            if (svgShapes.includes(shape)) {
              const svgNS = "http://www.w3.org/2000/svg";
              const svg = document.createElementNS(svgNS, "svg");
              svg.setAttribute("width", "100%");
              svg.setAttribute("height", "100%");
              svg.setAttribute("viewBox", "0 0 100 100");
              svg.setAttribute("preserveAspectRatio", "none");
              svg.style.backgroundColor = DEFAULT_NODE_COLOR;
              svg.style.border = "1px solid var(--border)";
              svg.style.boxSizing = "border-box";

              if (shape === "diamond") {
                const polygon = document.createElementNS(svgNS, "polygon");
                polygon.setAttribute("points", "50,0 100,50 50,100 0,50");
                polygon.setAttribute("fill", DEFAULT_NODE_COLOR);
                polygon.setAttribute("stroke", "var(--border)");
                polygon.setAttribute("stroke-width", "1");
                svg.appendChild(polygon);
              } else if (shape === "hexagon") {
                const polygon = document.createElementNS(svgNS, "polygon");
                polygon.setAttribute(
                  "points",
                  "25,0 75,0 100,50 75,100 25,100 0,50",
                );
                polygon.setAttribute("fill", DEFAULT_NODE_COLOR);
                polygon.setAttribute("stroke", "var(--border)");
                polygon.setAttribute("stroke-width", "1");
                svg.appendChild(polygon);
              } else if (shape === "cylinder") {
                const topEllipse = document.createElementNS(svgNS, "ellipse");
                topEllipse.setAttribute("cx", "50");
                topEllipse.setAttribute("cy", "20");
                topEllipse.setAttribute("rx", "50");
                topEllipse.setAttribute("ry", "20");
                topEllipse.setAttribute("fill", DEFAULT_NODE_COLOR);
                topEllipse.setAttribute("stroke", "var(--border)");
                topEllipse.setAttribute("stroke-width", "1");
                svg.appendChild(topEllipse);

                const rect = document.createElementNS(svgNS, "rect");
                rect.setAttribute("x", "0");
                rect.setAttribute("y", "20");
                rect.setAttribute("width", "100");
                rect.setAttribute("height", "60");
                rect.setAttribute("fill", DEFAULT_NODE_COLOR);
                rect.setAttribute("stroke", "var(--border)");
                rect.setAttribute("stroke-width", "1");
                svg.appendChild(rect);

                const bottomEllipse = document.createElementNS(
                  svgNS,
                  "ellipse",
                );
                bottomEllipse.setAttribute("cx", "50");
                bottomEllipse.setAttribute("cy", "80");
                bottomEllipse.setAttribute("rx", "50");
                bottomEllipse.setAttribute("ry", "20");
                bottomEllipse.setAttribute("fill", DEFAULT_NODE_COLOR);
                bottomEllipse.setAttribute("stroke", "var(--border)");
                bottomEllipse.setAttribute("stroke-width", "1");
                svg.appendChild(bottomEllipse);
              }

              preview.appendChild(svg);
            } else {
              preview.style.backgroundColor = DEFAULT_NODE_COLOR;
              preview.style.border = "1px solid var(--border)";
              if (shape === "pill" || shape === "circle") {
                preview.style.borderRadius = "9999px";
              } else {
                preview.style.borderRadius = "0px";
              }
            }

            document.body.appendChild(preview);
            event.dataTransfer.setDragImage(
              preview,
              SHAPE_DEFAULT_SIZES[shape].width / 2,
              SHAPE_DEFAULT_SIZES[shape].height / 2,
            );

            const handleDragEnd = () => {
              document.body.removeChild(preview);
              (event.currentTarget as HTMLElement).removeEventListener(
                "dragend",
                handleDragEnd,
              );
            };
            (event.currentTarget as HTMLElement).addEventListener(
              "dragend",
              handleDragEnd,
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
  selected,
  id,
}: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const textColor = getNodeTextColor(data.color);
  const nodeWidth = width ?? SHAPE_DEFAULT_SIZES[data.shape].width;
  const nodeHeight = height ?? SHAPE_DEFAULT_SIZES[data.shape].height;
  const borderColor = selected ? "var(--foreground)" : "var(--border)";
  const borderWidth = selected ? 2 : 1;

  // Focus textarea when entering edit mode
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setEditLabel(data.label);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }, 0);
  }, [data.label]);

  // Close editing on blur
  const handleBlur = useCallback(() => {
    if (editLabel !== data.label) {
      updateNodeData(id, { label: editLabel });
    }
    setIsEditing(false);
  }, [editLabel, data.label, id, updateNodeData]);

  // Close editing on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        setIsEditing(false);
        setEditLabel(data.label);
      } else if (e.key === "Enter" && e.ctrlKey) {
        handleBlur();
      }
    },
    [data.label, handleBlur],
  );

  // Prevent text interactions from triggering canvas drag/pan
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();
    },
    [],
  );

  const renderShape = () => {
    switch (data.shape) {
      case "rectangle":
        return (
          <div
            className="flex h-full w-full items-center justify-center text-center text-sm font-medium leading-5"
            style={{ color: textColor }}
            onDoubleClick={handleDoubleClick}
          >
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                className="nodrag nopan absolute inset-0 resize-none bg-transparent text-center text-sm font-medium leading-5 outline-none"
                style={{ color: textColor }}
                placeholder="Label"
              />
            ) : (
              <span className="px-2 py-1">{data.label || "Label"}</span>
            )}
          </div>
        );
      case "pill":
        return (
          <div
            className="flex h-full w-full items-center justify-center rounded-full text-center text-sm font-medium leading-5"
            style={{ color: textColor }}
            onDoubleClick={handleDoubleClick}
          >
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                className="nodrag nopan w-4/5 resize-none bg-transparent text-center text-sm font-medium leading-5 outline-none"
                style={{ color: textColor }}
                placeholder="Label"
              />
            ) : (
              <span className="px-2 py-1">{data.label || "Label"}</span>
            )}
          </div>
        );
      case "circle":
        return (
          <div
            className="flex h-full w-full items-center justify-center rounded-full text-center text-sm font-medium leading-5"
            style={{ color: textColor }}
            onDoubleClick={handleDoubleClick}
          >
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                className="nodrag nopan h-4/5 w-4/5 resize-none bg-transparent text-center text-sm font-medium leading-5 outline-none"
                style={{ color: textColor }}
                placeholder="Label"
              />
            ) : (
              <span className="px-2 py-1">{data.label || "Label"}</span>
            )}
          </div>
        );
      case "diamond":
        return (
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon
              points="50,0 100,50 50,100 0,50"
              fill={data.color}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
            <foreignObject x="10" y="25" width="80" height="50">
              <div
                className="flex h-full items-center justify-center text-center text-sm font-medium leading-5"
                style={{ color: textColor }}
                onDoubleClick={handleDoubleClick}
              >
                {isEditing ? (
                  <textarea
                    ref={textareaRef}
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onPointerDown={handlePointerDown}
                    className="nodrag nopan w-full resize-none bg-transparent text-center text-sm font-medium leading-5 outline-none"
                    style={{ color: textColor }}
                    placeholder="Label"
                  />
                ) : (
                  <span className="px-1">{data.label || "Label"}</span>
                )}
              </div>
            </foreignObject>
          </svg>
        );
      case "hexagon":
        return (
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon
              points="25,0 75,0 100,50 75,100 25,100 0,50"
              fill={data.color}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
            <foreignObject x="15" y="25" width="70" height="50">
              <div
                className="flex h-full items-center justify-center text-center text-sm font-medium leading-5"
                style={{ color: textColor }}
                onDoubleClick={handleDoubleClick}
              >
                {isEditing ? (
                  <textarea
                    ref={textareaRef}
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onPointerDown={handlePointerDown}
                    className="nodrag nopan w-full resize-none bg-transparent text-center text-sm font-medium leading-5 outline-none"
                    style={{ color: textColor }}
                    placeholder="Label"
                  />
                ) : (
                  <span className="px-1">{data.label || "Label"}</span>
                )}
              </div>
            </foreignObject>
          </svg>
        );
      case "cylinder":
        return (
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            onDoubleClick={handleDoubleClick}
          >
            <rect x="0" y="15" width="100" height="70" fill={data.color} />
            <line
              x1="0"
              y1="15"
              x2="0"
              y2="85"
              stroke={borderColor}
              strokeWidth="2"
            />
            <line
              x1="100"
              y1="15"
              x2="100"
              y2="85"
              stroke={borderColor}
              strokeWidth="2"
            />
            <ellipse
              cx="50"
              cy="85"
              rx="50"
              ry="15"
              fill={data.color}
              stroke={borderColor}
              strokeWidth="2"
            />
            <ellipse
              cx="50"
              cy="15"
              rx="50"
              ry="15"
              fill={data.color}
              stroke={borderColor}
              strokeWidth="2"
            />
            <foreignObject x="15" y="35" width="70" height="30">
              <div
                className="flex h-full items-center justify-center text-center text-sm font-medium leading-5"
                style={{ color: textColor }}
              >
                {isEditing ? (
                  <textarea
                    ref={textareaRef}
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onPointerDown={handlePointerDown}
                    className="nodrag nopan w-full resize-none bg-transparent text-center text-sm font-medium leading-5 outline-none"
                    style={{ color: textColor }}
                    placeholder="Label"
                  />
                ) : (
                  <span className="px-1">{data.label || "Label"}</span>
                )}
              </div>
            </foreignObject>
          </svg>
        );
      default:
        return null;
    }
  };

  const getBorderRadius = () => {
    switch (data.shape) {
      case "rectangle":
        return "0px";
      case "pill":
      case "circle":
        return "9999px";
      default:
        return "0px";
    }
  };

  const isCssShape = ["rectangle", "pill", "circle"].includes(data.shape);

  return (
    <div
      className="group relative shadow-lg shadow-background/40"
      style={{
        width: nodeWidth,
        height: nodeHeight,
        borderRadius: isCssShape ? getBorderRadius() : undefined,
        border: `${borderWidth}px solid ${borderColor}`,
        backgroundColor: isCssShape ? data.color : undefined,
        overflow: "visible",
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_SIZE.width}
        minHeight={MIN_NODE_SIZE.height}
        color="var(--foreground)"
        handleStyle={{
          width: 12,
          height: 12,
          border: "1px solid var(--background)",
          backgroundColor: "var(--foreground)",
        }}
        lineStyle={{
          borderColor: "var(--foreground)",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: isCssShape ? getBorderRadius() : undefined,
        }}
      >
        {renderShape()}
      </div>

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
