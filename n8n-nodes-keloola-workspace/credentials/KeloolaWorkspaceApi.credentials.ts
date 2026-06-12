import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  Icon,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class KeloolaWorkspaceApi implements ICredentialType {
  name = 'keloolaWorkspaceApi';
  displayName = 'Keloola Workspace API';
  icon = 'file:../icons/keloola.svg' as Icon;
  documentationUrl =
    'https://github.com/Thrive-Developer/keloola/tree/main/n8n-nodes-keloola-workspace#credentials';

  properties: INodeProperties[] = [
    {
      displayName: 'API Base URL',
      name: 'baseUrl',
      type: 'string',
      required: true,
      default: '',
      placeholder: 'https://api.example.com',
      description: 'Base URL for the Keloola Workspace API',
    },
    {
      displayName: 'Access Token',
      name: 'accessToken',
      type: 'string',
      required: true,
      typeOptions: { password: true },
      default: '',
      description: 'Bearer token used to authenticate Keloola Workspace API requests',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Accept: 'application/json',
        Authorization: '=Bearer {{$credentials.accessToken}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      method: 'GET',
      url: '={{$credentials.baseUrl}}/workspaces',
      headers: {
        'Accept-Language': 'en',
      },
    },
  };
}
