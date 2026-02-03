# n8n-nodes-keloola-accounting

This is an n8n community node. It lets you integrate [Keloola Accounting](https://keloola.xyz) services into your n8n workflows.

Keloola Accounting is a comprehensive platform for managing business finances, and this node allows for programmatic access to its features.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

**Resource: User**

- **Current User**: Retrieve details of the currently authenticated user.

## Credentials

To use this node, you need to authenticate with the Keloola Authentication API.

1.  Create a **Keloola Authentication API** credential in n8n.
2.  Provide your **Email** and **Password**.
3.  The node will automatically handle the JWT generation and token management.

## Compatibility

- **n8n version**: Tested on n8n v1.0+
- **Node.js**: v18 or higher

## Usage

This node simplifies interactions with the Keloola Accounting API. It handles authentication automatically using the provided credentials.

1.  Add the **Keloola Accounting** node to your workflow.
2.  Select the desired **Resource** (e.g., User).
3.  Select the **Operation** (e.g., Current User).
4.  Execute the node to retrieve data.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Keloola Website](https://keloola.xyz)
