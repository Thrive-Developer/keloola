import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IDataObject,
  NodeOperationError,
} from 'n8n-workflow';
import { credentials } from './constants';

export interface TokenCache {
  token: string;
  expiresAt: number;
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function getAccessToken(
  executeFunctions: IExecuteFunctions | ILoadOptionsFunctions,
  authBaseUrl: string,
): Promise<string> {
  const creds = await executeFunctions.getCredentials(credentials.name);
  let staticData: IDataObject | undefined;

  if ('getWorkflowStaticData' in executeFunctions) {
    staticData = executeFunctions.getWorkflowStaticData('global') as IDataObject;
  }

  let token = (staticData?.tokenCache as TokenCache | undefined)?.token;
  const tokenCache = staticData?.tokenCache as TokenCache | undefined;

  if (!token || (tokenCache && Date.now() >= tokenCache.expiresAt)) {
    const tokenResponse = await executeFunctions.helpers.httpRequest({
      method: 'POST',
      url: `${authBaseUrl}/jwt/generate-token`,
      body: { email: creds.email, password: creds.password },
      headers: { 'Content-Type': 'application/json' },
    });

    if (!tokenResponse?.access_token) {
      const errorMessage = 'Failed to obtain access token from Keloola Auth API';
      if ('getNode' in executeFunctions) {
        throw new NodeOperationError(executeFunctions.getNode(), errorMessage);
      }
      throw new Error(errorMessage);
    }

    token = tokenResponse.access_token as string;
    const decoded = decodeJwtPayload(token);

    const expiresAt = decoded?.exp ? decoded.exp * 1000 - 60000 : Date.now() + (3600000 - 60000);

    if (staticData) {
      staticData.tokenCache = {
        token,
        expiresAt,
      };
    }
  }

  return token as string;
}
