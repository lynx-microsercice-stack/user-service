export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'user_service',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || 'password',
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  eureka: {
    host: process.env.EUREKA_HOST || 'localhost',
    port: parseInt(process.env.EUREKA_PORT || '8761', 10),
    servicePath: '/eureka/apps/',
  },
  apiGatewayUrl: process.env.API_GATEWAY_URL || 'http://localhost:3000',
  auth: {
    clientId: process.env.AUTH_SERVICE_CLIENT_ID || 'user-service',
    clientSecret:
      process.env.AUTH_SERVICE_CLIENT_SECRET || 'user-service-secret',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  },
});
