import { Injectable } from '@nestjs/common';
import configuration from 'src/config/configuration';

@Injectable()
export class ApiEndpoints {
  private readonly apiGatewayUrl: string;
  constructor() {
    this.apiGatewayUrl = configuration().apiGatewayUrl;
  }

  // Auth Service
  auth = {
    baseUrl: () => `${this.apiGatewayUrl}/api/v1/auth`,
    register: () => `${this.auth.baseUrl()}/register`,
    validate: () => `${this.auth.baseUrl()}/validate`,
    fetchToken: () => `${this.auth.baseUrl()}/token/client`,
    delete: (keycloakId: string) =>
      `${this.auth.baseUrl()}/delete/user/${keycloakId}`,
    findUserByKeycloakId: (keycloakId: string) =>
      `${this.auth.baseUrl()}/user/${keycloakId}`,
    findAllKeycloakUsers: () => `${this.auth.baseUrl()}/users`,
  };
}
