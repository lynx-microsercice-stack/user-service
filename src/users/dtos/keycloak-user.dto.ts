export class KeycloakUserDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  createdTimestamp: number;
  enabled: boolean;
  totp: boolean;
  disableableCredentialTypes: string[];
  requiredActions: string[];
  notBefore: number;
  access: {
    manageGroupMembership: boolean;
    view: boolean;
    mapRoles: boolean;
    impersonate: boolean;
    manage: boolean;
  };
}

// "id" : "f0dd3e3c-f352-42ee-8c28-8dd58f264e4d",
//   "username" : "tech",
//   "firstName" : "lynx",
//   "lastName" : "lynx",
//   "email" : "technical@email.com",
//   "emailVerified" : false,
//   "createdTimestamp" : 1743306004275,
//   "enabled" : true,
//   "totp" : false,
//   "disableableCredentialTypes" : [ ],
//   "requiredActions" : [ ],
//   "notBefore" : 0,
//   "access" : {
//     "manageGroupMembership" : true,
//     "view" : true,
//     "mapRoles" : true,
//     "impersonate" : true,
//     "manage" : true
//   }
