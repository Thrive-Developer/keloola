# n8n-nodes-keloola-workspace

This is an n8n community node package for **Keloola Workspace**. It provides the initial package structure for integrating Keloola Workspace with n8n workflows.

[n8n](https://n8n.io/) is a workflow automation platform.

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Credentials

Create a **Keloola Workspace API** credential in n8n with:

- **API Base URL**: The base URL for the Keloola Workspace API.
- **Access Token**: Bearer token used to authenticate requests.

## Operations

### Resource: Workspace

- **Get Many**: Retrieve a paginated workspace list.
- **Get**: Retrieve one workspace by ID.

## Development

From the monorepo root:

```bash
bun install
bun run prebuild
bun run build
```

To link the package into a local n8n installation:

```bash
bun run link:nodes
```

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Keloola repository](https://github.com/Thrive-Developer/keloola)
