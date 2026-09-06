import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor() {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("joinOrganization")
  async handleJoinOrganization(client: Socket, payload: { orgId: string }) {
    client.join(`org:${payload.orgId}`);
  }

  // يُستدعى من أي مكان في الخادم لبث إشعار جديد
  async broadcastNotification(orgId: string, notification: any) {
    this.server.to(`org:${orgId}`).emit("notification:new", notification);
  }
}
