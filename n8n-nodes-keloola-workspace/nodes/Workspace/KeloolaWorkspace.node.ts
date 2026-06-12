import {
  IExecuteFunctions,
  INodeExecutionData,
  NodeConnectionTypes,
  NodeOperationError,
  type IDataObject,
  type INodeType,
  type INodeTypeDescription,
} from 'n8n-workflow';

interface KeloolaWorkspaceCredentials {
  baseUrl?: string;
  accessToken?: string;
}

const credentialName = 'keloolaWorkspaceApi';

export class KeloolaWorkspace implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Keloola Workspace',
    name: 'keloolaWorkspace',
    icon: 'file:../../icons/workspace.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Keloola Workspace API',
    defaults: {
      name: 'Keloola Workspace',
    },
    usableAsTool: true,
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: credentialName, required: true }],
    requestDefaults: {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
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
            name: 'Workspace',
            value: 'workspace',
          },
        ],
        default: 'workspace',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['workspace'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get a workspace by ID',
            action: 'Get a workspace',
          },
          {
            name: 'Get Many',
            value: 'getAll',
            description: 'Get many workspaces',
            action: 'Get many workspaces',
          },
        ],
        default: 'getAll',
      },
      {
        displayName: 'Workspace ID',
        name: 'workspaceId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['workspace'],
            operation: ['get'],
          },
        },
        description: 'The ID of the workspace',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: 1,
        typeOptions: {
          minValue: 1,
        },
        displayOptions: {
          show: {
            resource: ['workspace'],
            operation: ['getAll'],
          },
        },
        description: 'Page number for pagination',
      },
      {
        displayName: 'Per Page',
        name: 'perPage',
        type: 'number',
        default: 10,
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        displayOptions: {
          show: {
            resource: ['workspace'],
            operation: ['getAll'],
          },
        },
        description: 'Number of workspaces to return per page',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['workspace'],
            operation: ['getAll'],
          },
        },
        description: 'Search term for filtering workspaces',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const credentials = (await this.getCredentials(
      credentialName,
    )) as KeloolaWorkspaceCredentials;
    const baseUrl = String(credentials.baseUrl || '').replace(/\/+$/, '');
    const accessToken = String(credentials.accessToken || '');
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    if (!baseUrl) {
      throw new NodeOperationError(
        this.getNode(),
        'Keloola Workspace API Base URL is required',
      );
    }

    if (!accessToken) {
      throw new NodeOperationError(
        this.getNode(),
        'Keloola Workspace API Access Token is required',
      );
    }

    let url = '';
    const query: IDataObject = {};

    if (resource === 'workspace') {
      if (operation === 'getAll') {
        query.page = this.getNodeParameter('page', 0);
        query.per_page = this.getNodeParameter('perPage', 0);

        const search = this.getNodeParameter('search', 0) as string;
        if (search) {
          query.search = search;
        }

        url = `${baseUrl}/workspaces`;
      }

      if (operation === 'get') {
        const workspaceId = this.getNodeParameter('workspaceId', 0) as string;
        url = `${baseUrl}/workspaces/${encodeURIComponent(workspaceId)}`;
      }
    }

    if (!url) {
      throw new NodeOperationError(this.getNode(), `No operation found for ${resource}`);
    }

    try {
      const response = await this.helpers.httpRequest({
        method: 'GET',
        url,
        qs: query,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept-Language': 'en',
        },
        json: true,
      });

      return [this.helpers.returnJsonArray(response)];
    } catch (error) {
      if (error.response) {
        throw new NodeOperationError(
          this.getNode(),
          `${JSON.stringify(error.response.data || error.message)}`,
          {
            description: `Status: ${error.response.status}\nURL: ${url}\nQuery: ${JSON.stringify(query, null, 2)}`,
          },
        );
      }

      throw error;
    }
  }
}
