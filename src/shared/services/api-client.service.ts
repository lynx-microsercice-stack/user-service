import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import configuration from 'src/config/configuration';
import { AuthServiceRegisterUserReqDto } from 'src/users/dtos/auth-service-register-user-req.dto';
import { ApiEndpoints } from '../utils/api-endpoint.util';
import { getTokenRealmTypeKey, TokenType } from '../enums/token-realm.type';
import { RedisService } from './redis.service';

interface AuthMethods {
  register: (userData: AuthServiceRegisterUserReqDto) => Promise<any>;
  validate: (token: string) => Promise<void>;
  delete: (keycloakId: string) => Promise<any>;
  findUserByKeycloakId: (keycloakId: string) => Promise<any>;
  findAllKeycloakUsers: () => Promise<any>;
  fetchTechnicalToken: () => Promise<string>;
  fetchCertificateToken: () => Promise<string>;
}

@Injectable()
export class ApiClientService {
  private readonly logger = new Logger(ApiClientService.name);
  public auth: AuthMethods;

  constructor(
    private readonly endpointService: ApiEndpoints,
    private readonly redisService: RedisService,
  ) {
    // Initialize auth methods with proper binding
    this.initializeAuthMethods();
  }

  private initializeAuthMethods(): void {
    this.auth = {
      register: async (userData: AuthServiceRegisterUserReqDto) => {
        const token = await this.getToken(TokenType.TECHNICAL_USER);
        this.logger.log('Registering user with data:', {
          ...userData,
          password: '[REDACTED]',
        });
        return this.fetch(this.endpointService.auth.register(), {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      },

      validate: async (token: string) => {
        if (!token) {
          this.logger.error('No token provided');
          throw new HttpException(
            'You are not authorized to access this resource',
            HttpStatus.UNAUTHORIZED,
          );
        }
        await this.fetch(this.endpointService.auth.validate(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      },

      delete: async (keycloakId: string) => {
        const token = await this.getToken(TokenType.TECHNICAL_USER);
        if (!token) {
          this.logger.error('No token provided');
          throw new HttpException(
            'You are not authorized to access this resource',
            HttpStatus.UNAUTHORIZED,
          );
        }

        this.logger.log('Deleting user with keycloakId:', keycloakId);
        return this.fetch(this.endpointService.auth.delete(keycloakId), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      },

      findUserByKeycloakId: async (keycloakId: string) => {
        const token = await this.getToken(TokenType.TECHNICAL_USER);
        if (!token) {
          this.logger.error('No token provided');
          throw new HttpException(
            'You are not authorized to access this resource',
            HttpStatus.UNAUTHORIZED,
          );
        }
        return this.fetch(
          this.endpointService.auth.findUserByKeycloakId(keycloakId),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
      },

      findAllKeycloakUsers: async () => {
        const token = await this.getToken(TokenType.TECHNICAL_USER);
        if (!token) {
          this.logger.error('No token provided');
          throw new HttpException(
            'You are not authorized to access this resource',
            HttpStatus.UNAUTHORIZED,
          );
        }
        return this.fetch(this.endpointService.auth.findAllKeycloakUsers(), {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      },

      fetchTechnicalToken: async (): Promise<string> => {
        this.logger.log('Fetching technical token ...');
        const response = await fetch(this.endpointService.auth.fetchToken(), {
          method: 'POST',
          body: JSON.stringify({
            client_id: configuration().auth.clientId,
            client_secret: configuration().auth.clientSecret,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          this.logger.error('Failed to fetch technical token');
          throw new HttpException(`[${response.status}] Failed to fetch technical token`, response.status);
        }
        const responseData = await response.json();
        const token = responseData.data;
        this.logger.log(`Technical token fetched successfully: ${token}`);
        return token;
      },

      fetchCertificateToken: async (): Promise<string> => {
        const response = await fetch(
          this.endpointService.auth.fetchCertificateToken(),
          {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${'req_token'}`,
            },
          },
        );
        const data = await response.json();
        const token = data.accessToken;
        return token;
      },
    };
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const startTime = Date.now();
    this.logger.log(`Making request to: ${url}`);
    this.logger.debug('Request options:', {
      method: options.method,
      headers: options.headers,
      body: options.body,
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const responseTime = Date.now() - startTime;
      const responseBody = await response.json().catch(() => ({}));

      this.logger.debug('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        time: `${responseTime}ms`,
      });

      if (!response.ok) {
        this.logger.error('Request failed:', {
          url,
          status: response.status,
          body: responseBody,
          time: `${responseTime}ms`,
        });
        switch (response.status) {
          case 401:
            throw new HttpException('Invalid token', response.status);
          case 403:
            throw new HttpException(
              'User has no required roles',
              response.status,
            );
          case 409:
            throw new HttpException('User already exists', response.status);
          default:
            throw new HttpException('External service error', response.status);
        }
      }

      return responseBody;
    } catch (error) {
      throw error;
    }
  }

  async retryFetchTokenWrapper(
    fn: () => Promise<any>,
    retries: number = 3,
    delay: number = 1000, // 1 second,
    tokenType: TokenType = TokenType.TECHNICAL_USER,
  ) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (error instanceof HttpException && error.getStatus() === 401) {
          this.logger.log('Token expired, retrying...');
          await this.refreshToken(tokenType);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  async refreshToken(tokenType: TokenType): Promise<string> {
    switch (tokenType) {
      case TokenType.TECHNICAL_USER:
        const technicalToken = await this.auth.fetchTechnicalToken();
        await this.redisService.storeToken(
          getTokenRealmTypeKey(tokenType),
          technicalToken,
        );
        return technicalToken;
      case TokenType.CERTIFICATE_USER:
        const certificateToken = await this.auth.fetchCertificateToken();
        await this.redisService.storeToken(
          getTokenRealmTypeKey(tokenType),
          certificateToken,
        );
        return certificateToken;
      default:
        throw new Error('Invalid token type');
    }
  }

  async getToken(tokenType: TokenType) {
    const token = await this.redisService.getToken(
      getTokenRealmTypeKey(tokenType),
    );
    if (!token) {
      this.logger.log('No token found in Redis');
      throw new HttpException('No token found in Redis', HttpStatus.UNAUTHORIZED);
    }
    return token;
  }
}
