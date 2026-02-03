import type { ICredentialTestRequest, Icon, ICredentialType, INodeProperties } from 'n8n-workflow';
import { ENV } from '../env';

export class KeloolaApi implements ICredentialType {
  name = 'keloolaApi';
  displayName = 'Keloola Authentication API';
  icon: Icon = 'file:keloola.svg';
  documentationUrl = 'https://github.com/Thrive-Developer/keloola?tab=readme-ov-file#credentials';

  properties: INodeProperties[] = [
    {
      displayName: 'Email',
      name: 'email',
      type: 'string',
      required: true,
      default: '',
      resolvableField: true,
    },
    {
      displayName: 'Password',
      name: 'password',
      type: 'string',
      required: true,
      typeOptions: { password: true },
      default: '',
      resolvableField: true,
    },
    {
      displayName: 'Auth API URL',
      name: 'authUrl',
      type: 'string',
      required: true,
      default: ENV.AUTH_BASE_URL,
      placeholder: ENV.AUTH_BASE_URL,
    },
  ];

  test: ICredentialTestRequest = {
    request: {
      method: 'POST',
      url: '={{$credentials.authUrl}}/jwt/generate-token',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        email: '={{$credentials.email}}',
        password: '={{$credentials.password}}',
      },
    },
  };
}
