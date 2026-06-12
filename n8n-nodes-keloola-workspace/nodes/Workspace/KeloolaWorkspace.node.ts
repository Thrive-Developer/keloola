import {
  IExecuteFunctions,
  IHttpRequestMethods,
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

function buildConnectorFields(connectorFields: IDataObject): IDataObject {
  const connectorFieldsBody: IDataObject = {};

  for (const key of ['daily_task_category_id', 'daily_task_type_id', 'objective_id']) {
    const value = connectorFields[key] as string | undefined;
    if (value) {
      connectorFieldsBody[key] = value;
    }
  }

  const keyResults = connectorFields.key_results as string | undefined;
  if (keyResults) {
    connectorFieldsBody.key_results = keyResults
      .split(',')
      .map((keyResult) => keyResult.trim())
      .filter(Boolean);
  }

  return connectorFieldsBody;
}

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
            name: 'Create Task',
            value: 'createTask',
            description: 'Create a new task',
            action: 'Create a task',
          },
          {
            name: 'Delete Task',
            value: 'deleteTask',
            description: 'Delete a task permanently',
            action: 'Delete a task',
          },
          {
            name: 'Get Task Detail',
            value: 'getTaskDetail',
            description: 'Get task detail by ID',
            action: 'Get task detail',
          },
          {
            name: 'List Tasks',
            value: 'listTasks',
            description: 'List tasks with pagination',
            action: 'List tasks',
          },
          {
            name: 'Update Task',
            value: 'updateTask',
            description: 'Update an existing task',
            action: 'Update a task',
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
            operation: ['createTask', 'listTasks'],
          },
        },
        description: 'Project UUID to list tasks from',
      },
      {
        displayName: 'Task ID',
        name: 'task_id',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['deleteTask', 'getTaskDetail', 'updateTask'],
          },
        },
        description: 'Task UUID',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['createTask'],
          },
        },
        description: 'Title of the task',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['updateTask'],
          },
        },
        description: 'New title for the task',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['createTask', 'updateTask'],
          },
        },
        description: 'Description of the task',
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
        default: 'medium',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['createTask'],
          },
        },
        options: [
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
        description: 'Priority of the task',
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
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['updateTask'],
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
        description: 'New priority for the task',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        default: 'task',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['createTask'],
          },
        },
        options: [
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
        description: 'Type of the task',
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
        displayName: 'Type',
        name: 'type',
        type: 'options',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['updateTask'],
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
        description: 'New type for the task',
      },
      {
        displayName: 'Assignee ID',
        name: 'assignee_id',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['createTask', 'listTasks', 'updateTask'],
          },
        },
        description: 'Assignee UUID used for filtering or assignment',
      },
      {
        displayName: 'Column ID',
        name: 'column_id',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['createTask', 'updateTask'],
          },
        },
        description: 'Column UUID for the task',
      },
      {
        displayName: 'Sprint ID',
        name: 'sprint_id',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['createTask', 'updateTask'],
          },
        },
        description: 'Sprint UUID for the task',
      },
      {
        displayName: 'Due Date',
        name: 'due_date',
        type: 'string',
        default: '',
        placeholder: '2026-07-01',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['createTask', 'updateTask'],
          },
        },
        description: 'Due date in YYYY-MM-DD format',
      },
      {
        displayName: 'Points',
        name: 'points',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['createTask', 'updateTask'],
          },
        },
        description: 'Numeric story points for the task',
      },
      {
        displayName: 'Is Completed',
        name: 'is_completed',
        type: 'options',
        default: '',
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['updateTask'],
          },
        },
        options: [
          {
            name: 'Any',
            value: '',
          },
          {
            name: 'False',
            value: false,
          },
          {
            name: 'True',
            value: true,
          },
        ],
        description: 'Whether the task is completed',
      },
      {
        displayName: 'Connector Fields',
        name: 'connector_fields',
        type: 'collection',
        placeholder: 'Add Connector Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['task'],
            operation: ['createTask', 'updateTask'],
          },
        },
        options: [
          {
            displayName: 'BOS Category ID',
            name: 'daily_task_category_id',
            type: 'string',
            default: '',
            description: 'BOS daily task category remote ID',
          },
          {
            displayName: 'BOS Type ID',
            name: 'daily_task_type_id',
            type: 'string',
            default: '',
            description: 'BOS daily task type remote ID',
          },
          {
            displayName: 'Objective ID',
            name: 'objective_id',
            type: 'string',
            default: '',
            description: 'BOS objective remote ID',
          },
          {
            displayName: 'Key Results',
            name: 'key_results',
            type: 'string',
            default: '',
            description: 'Comma-separated BOS key result remote IDs',
          },
        ],
        description: 'BOS connector fields required when BOS is enabled',
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
    const credentials = (await this.getCredentials(credentialName)) as KeloolaWorkspaceCredentials;
    const baseUrl = String(credentials.baseUrl || '').replace(/\/+$/, '');
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    if (!baseUrl) {
      throw new NodeOperationError(this.getNode(), 'Keloola Workspace API Base URL is required');
    }

    let url = '';
    let method: IHttpRequestMethods = 'GET';
    const query: IDataObject = {};
    const body: IDataObject = {};

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
      if (operation === 'createTask') {
        const projectId = this.getNodeParameter('project_id', 0) as string;
        const title = this.getNodeParameter('title', 0) as string;

        if (!projectId) {
          throw new NodeOperationError(this.getNode(), 'Project ID is required');
        }

        if (!title) {
          throw new NodeOperationError(this.getNode(), 'Title is required');
        }

        body.project_id = projectId;
        body.title = title;
        body.priority = this.getNodeParameter('priority', 0) as string;
        body.type = this.getNodeParameter('type', 0) as string;

        const description = this.getNodeParameter('description', 0) as string;
        if (description) {
          body.description = description;
        }

        const assigneeId = this.getNodeParameter('assignee_id', 0) as string;
        if (assigneeId) {
          body.assignee_id = assigneeId;
        }

        const columnId = this.getNodeParameter('column_id', 0) as string;
        if (columnId) {
          body.column_id = columnId;
        }

        const sprintId = this.getNodeParameter('sprint_id', 0) as string;
        if (sprintId) {
          body.sprint_id = sprintId;
        }

        const dueDate = this.getNodeParameter('due_date', 0) as string;
        if (dueDate) {
          body.due_date = dueDate;
        }

        const points = this.getNodeParameter('points', 0) as string;
        if (points) {
          body.points = Number(points);
        }

        const connectorFields = this.getNodeParameter('connector_fields', 0, {}) as IDataObject;
        const connectorFieldsBody = buildConnectorFields(connectorFields);

        if (Object.keys(connectorFieldsBody).length) {
          body.connector_fields = connectorFieldsBody;
        }

        method = 'POST';
        url = `${baseUrl}/tasks`;
      }

      if (operation === 'deleteTask') {
        const taskId = this.getNodeParameter('task_id', 0) as string;

        if (!taskId) {
          throw new NodeOperationError(this.getNode(), 'Task ID is required');
        }

        method = 'DELETE';
        url = `${baseUrl}/tasks/${encodeURIComponent(taskId)}`;
      }

      if (operation === 'getTaskDetail') {
        const taskId = this.getNodeParameter('task_id', 0) as string;

        if (!taskId) {
          throw new NodeOperationError(this.getNode(), 'Task ID is required');
        }

        url = `${baseUrl}/tasks/${encodeURIComponent(taskId)}`;
      }

      if (operation === 'updateTask') {
        const taskId = this.getNodeParameter('task_id', 0) as string;

        if (!taskId) {
          throw new NodeOperationError(this.getNode(), 'Task ID is required');
        }

        const title = this.getNodeParameter('title', 0, '') as string;
        if (title) {
          body.title = title;
        }

        const description = this.getNodeParameter('description', 0, '') as string;
        if (description) {
          body.description = description;
        }

        const priority = this.getNodeParameter('priority', 0, '') as string;
        if (priority) {
          body.priority = priority;
        }

        const type = this.getNodeParameter('type', 0, '') as string;
        if (type) {
          body.type = type;
        }

        const assigneeId = this.getNodeParameter('assignee_id', 0, '') as string;
        if (assigneeId) {
          body.assignee_id = assigneeId;
        }

        const columnId = this.getNodeParameter('column_id', 0, '') as string;
        if (columnId) {
          body.column_id = columnId;
        }

        const sprintId = this.getNodeParameter('sprint_id', 0, '') as string;
        if (sprintId) {
          body.sprint_id = sprintId;
        }

        const dueDate = this.getNodeParameter('due_date', 0, '') as string;
        if (dueDate) {
          body.due_date = dueDate;
        }

        const points = this.getNodeParameter('points', 0, '') as string;
        if (points) {
          body.points = Number(points);
        }

        const isCompleted = this.getNodeParameter('is_completed', 0, '') as boolean | string;
        if (isCompleted !== '') {
          body.is_completed = isCompleted === true || isCompleted === 'true';
        }

        const connectorFields = this.getNodeParameter('connector_fields', 0, {}) as IDataObject;
        const connectorFieldsBody = buildConnectorFields(connectorFields);

        if (Object.keys(connectorFieldsBody).length) {
          body.connector_fields = connectorFieldsBody;
        }

        if (!Object.keys(body).length) {
          throw new NodeOperationError(
            this.getNode(),
            'At least one field is required to update a task',
          );
        }

        method = 'PUT';
        url = `${baseUrl}/tasks/${encodeURIComponent(taskId)}`;
      }

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
      const response = await this.helpers.httpRequestWithAuthentication.call(this, credentialName, {
        method,
        url,
        qs: query,
        body: Object.keys(body).length ? body : undefined,
        headers: {
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
            description: `Status: ${error.response.status}\nMethod: ${method}\nURL: ${url}\nQuery: ${JSON.stringify(query, null, 2)}\nBody: ${JSON.stringify(body, null, 2)}`,
          },
        );
      }

      throw error;
    }
  }
}
