import {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  INodeExecutionData,
  NodeConnectionTypes,
  type INodeType,
  type INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import { userDescription } from './resources/user';
import { ENV } from '../../env';

interface TokenCache {
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

export class KeloolaAccounting implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Keloola Accounting',
    name: 'keloolaAccounting',
    icon: 'file:../../icons/accounting.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Keloola Accounting API',
    defaults: {
      name: 'Keloola Accounting',
    },
    usableAsTool: true,
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: 'keloolaApi', required: true }],
    requestDefaults: {
      baseURL: ENV.ACCOUNTING_BASE_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'User',
            value: 'user',
          },
        ],
        default: 'user',
      },
      ...userDescription,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    const creds = await this.getCredentials('keloolaApi');
    const staticData = this.getWorkflowStaticData('global') as IDataObject;

    let token = (staticData.tokenCache as TokenCache | undefined)?.token;
    const tokenCache = staticData.tokenCache as TokenCache | undefined;

    if (!token || (tokenCache && Date.now() >= tokenCache.expiresAt)) {
      const tokenResponse = await this.helpers.httpRequest({
        method: 'POST',
        url: `${ENV.AUTH_BASE_URL}/jwt/generate-token`,
        body: { email: creds.email, password: creds.password },
        headers: { 'Content-Type': 'application/json' },
      });

      if (!tokenResponse?.access_token) {
        throw new NodeOperationError(
          this.getNode(),
          'Failed to obtain access token from Keloola Auth API',
        );
      }

      token = tokenResponse.access_token as string;
      const decoded = decodeJwtPayload(token);

      const expiresAt = decoded?.exp ? decoded.exp * 1000 - 60000 : Date.now() + (3600000 - 60000);

      staticData.tokenCache = {
        token,
        expiresAt,
      };
    }

    let url = '';
    let method: IHttpRequestMethods = 'GET';

    if (resource === 'user' && operation === 'currentUser') {
      url = `${ENV.ACCOUNTING_BASE_URL}/user`;
      method = 'GET';
    }

    const response = await this.helpers.httpRequest({
      method,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return [this.helpers.returnJsonArray(response)];
  }
}
