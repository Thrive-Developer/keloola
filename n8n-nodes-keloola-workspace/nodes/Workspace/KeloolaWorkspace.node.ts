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
            name: 'Task',
            value: 'task',
          },
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
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['task'],
          },
        },
        options: [
          {
            name: 'List Tasks',
            value: 'listTasks',
            description: 'List tasks with pagination',
            action: 'List tasks',
          },
        ],
        default: 'listTasks',
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
      {
        displayName: 'Project ID',
        name: 'project_id',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['listTasks'],
          },
        },
        description: 'Project UUID to list tasks from',
      },
      {
        displayName: 'Search',
        name: 'search',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['listTasks'],
          },
        },
        description: 'Search tasks by title',
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['listTasks'],
          },
        },
        options: [
          {
            name: 'Any',
            value: '',
          },
          {
            name: 'High',
            value: 'high',
          },
          {
            name: 'Low',
            value: 'low',
          },
          {
            name: 'Medium',
            value: 'medium',
          },
          {
            name: 'Urgent',
            value: 'urgent',
          },
        ],
        description: 'Filter by priority',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['listTasks'],
          },
        },
        options: [
          {
            name: 'Any',
            value: '',
          },
          {
            name: 'Bug',
            value: 'bug',
          },
          {
            name: 'Epic',
            value: 'epic',
          },
          {
            name: 'Story',
            value: 'story',
          },
          {
            name: 'Task',
            value: 'task',
          },
        ],
        description: 'Filter by task type',
      },
      {
        displayName: 'Assignee ID',
        name: 'assignee_id',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['listTasks'],
          },
        },
        description: 'Filter by assignee UUID',
      },
      {
        displayName: 'Per Page',
        name: 'per_page',
        type: 'number',
        default: 20,
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['listTasks'],
          },
        },
        description: 'Items per page',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const credentials = (await this.getCredentials(
      credentialName,
    )) as KeloolaWorkspaceCredentials;
    const baseUrl = String(credentials.baseUrl || '').replace(/\/+$/, '');
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    if (!baseUrl) {
      throw new NodeOperationError(
        this.getNode(),
        'Keloola Workspace API Base URL is required',
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

    if (resource === 'task') {
      if (operation === 'listTasks') {
        const projectId = this.getNodeParameter('project_id', 0) as string;

        if (!projectId) {
          throw new NodeOperationError(this.getNode(), 'Project ID is required');
        }

        query.project_id = projectId;
        query.per_page = this.getNodeParameter('per_page', 0);

        const search = this.getNodeParameter('search', 0) as string;
        if (search) {
          query.search = search;
        }

        const priority = this.getNodeParameter('priority', 0) as string;
        if (priority) {
          query.priority = priority;
        }

        const type = this.getNodeParameter('type', 0) as string;
        if (type) {
          query.type = type;
        }

        const assigneeId = this.getNodeParameter('assignee_id', 0) as string;
        if (assigneeId) {
          query.assignee_id = assigneeId;
        }

        url = `${baseUrl}/tasks`;
      }
    }

    if (!url) {
      throw new NodeOperationError(this.getNode(), `No operation found for ${resource}`);
    }

    try {
      const response = await this.helpers.httpRequestWithAuthentication.call(
        this,
        credentialName,
        {
          method: 'GET',
          url,
          qs: query,
          headers: {
            'Accept-Language': 'en',
          },
          json: true,
        },
      );

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
