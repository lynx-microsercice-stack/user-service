import { Constants } from 'src/constant';

export enum TokenType {
  TECHNICAL_USER = 'tech_auth',
  CERTIFICATE_USER = 'cert_auth',
}

export function getTokenRealmTypeKey(tokenType: TokenType) {
  return `${Constants.TOKEN_REDIS_KEY_PREFIX}${tokenType}`;
}
