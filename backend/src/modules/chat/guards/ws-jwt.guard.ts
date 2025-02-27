import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: CustomLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = client.handshake.auth.token || 
                    client.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        throw new WsException('Unauthorized access - No token provided');
      }
      
      const payload = this.jwtService.verify(token);
      // Attach user to socket
      client['user'] = payload;
      
      return true;
    } catch (error) {
      this.logger.error('WebSocket authentication error', error);
      throw new WsException('Unauthorized access');
    }
  }
} 