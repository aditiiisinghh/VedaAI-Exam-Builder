import type { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";

const clients = new Map<string, Set<WebSocket>>();

export function attachSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket, request) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const assignmentId = url.searchParams.get("assignmentId");

    if (!assignmentId) {
      socket.close(1008, "assignmentId is required");
      return;
    }

    const sockets = clients.get(assignmentId) ?? new Set<WebSocket>();
    sockets.add(socket);
    clients.set(assignmentId, sockets);

    socket.on("close", () => {
      sockets.delete(socket);
      if (sockets.size === 0) {
        clients.delete(assignmentId);
      }
    });
  });
}

export function publishAssignmentEvent(assignmentId: string, payload: unknown) {
  const sockets = clients.get(assignmentId);
  if (!sockets) return;

  const message = JSON.stringify(payload);
  sockets.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  });
}
