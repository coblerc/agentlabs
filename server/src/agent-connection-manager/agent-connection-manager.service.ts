import { Injectable, Logger } from '@nestjs/common';
import { AgentConnectionDto } from 'src/agents/dtos/agent-connection.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AgentConnection,
  RegisterAgentConnectionPayload,
} from './agent-connection-manager.types';

@Injectable()
export class AgentConnectionManagerService {
  private sidToConnection = new Map<string, AgentConnection>();
  private agentKeyToConnection = new Map<string, AgentConnection>();
  private readonly logger = new Logger(AgentConnectionManagerService.name);

  constructor(private readonly prisma: PrismaService) {
    setInterval(() => {
      const agentCount = this.agentKeyToConnection.size;

      this.logger.debug(`Connected agents: ${agentCount}`);
    }, 5000);
  }

  private computeAgentKey(projectId: string, agentId: string): string {
    return `${projectId}:${agentId}`;
  }

  private getConnectionByAgentKey(agentKey: string): AgentConnection | null {
    return this.agentKeyToConnection.get(agentKey) || null;
  }

  getConnection(projectId: string, agentId: string): AgentConnection | null {
    const key = this.computeAgentKey(projectId, agentId);

    return this.getConnectionByAgentKey(key);
  }

  hasConnection(projectId: string, agentId: string): boolean {
    return !!this.getConnection(projectId, agentId);
  }

  getConnectionBySid(sid: string): AgentConnection | null {
    return this.sidToConnection.get(sid) || null;
  }

  serializeConnection(connection: AgentConnection): AgentConnectionDto {
    return {
      agentId: connection.agentId,
      createdAt: connection.createdAt.toISOString(),
      ip: connection.ip,
      sid: connection.socket.id,
    };
  }

  listSerializedConnectionsByAgentId(agentId: string): AgentConnectionDto[] {
    const connections = Array.from(this.agentKeyToConnection.values()).filter(
      (connection) => connection.agentId === agentId,
    );

    return connections.map((connection) =>
      this.serializeConnection(connection),
    );
  }

  async registerConnection({
    socket,
    projectId,
    agentId,
    ip,
  }: RegisterAgentConnectionPayload): Promise<void> {
    const key = this.computeAgentKey(projectId, agentId);
    const connection: AgentConnection = {
      projectId,
      agentId,
      agentKey: key,
      socket,
      createdAt: new Date(),
      ip,
    };

    await this.prisma.agentConnectionLog.create({
      data: {
        agentId,
        ipAddress: ip,
        id: socket.id,
      },
    });

    this.sidToConnection.set(socket.id, connection);
    this.agentKeyToConnection.set(key, connection);
  }

  removeConnectionBySid(sid: string): boolean {
    const connection = this.getConnectionBySid(sid);

    if (!connection) {
      return false;
    }

    this.sidToConnection.delete(sid);
    this.agentKeyToConnection.delete(connection.agentKey);

    return true;
  }
}
