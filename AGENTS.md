# Agent Guide for Keloola n8n Nodes

This document provides guidelines for AI agents and developers working on the Keloola n8n nodes repository. This is a monorepo managed with **Turbo** and **Bun**.

## 1. Environment & Commands

### Setup

- **Package Manager**: `bun` (Version 1.3.5 or higher is required).
- **Node Version**: `>=18`.
- **Workspaces**: defined in `package.json` (e.g., `n8n-nodes-keloola-accounting`, `support`).

### Build & Development

Before running build or dev, ensure environment files are generated.

- **Install**:
  ```bash
  bun install
  ```
- **Generate Environment Files**:
  ```bash
  bun run prebuild
  ```
  _Crucial step: Runs `generate-env.ts` and `distribute-shared.ts` in workspaces to generate environment variables and copy shared resources._
- **Build All**:
  ```bash
  bun run build
  ```
- **Develop (Watch Mode)**:
  ```bash
  bun run dev
  ```
- **Clean Artifacts**:
  ```bash
  bun run clean
  ```

### Linting & Formatting

The project uses ESLint (via `@n8n/node-cli`) and Prettier.

- **Lint**:
  ```bash
  bun run lint
  ```
- **Fix Lint Issues**:
  ```bash
  bun run lint:fix
  # or within a workspace:
  n8n-node lint --fix
  ```
- **Format Code**:
  ```bash
  bun run format
  ```
- **Check Types**:
  ```bash
  bun run check-types
  ```

### Testing

_Note: Currently, no automated test suite (Jest/Vitest) is configured in the analyzed workspaces._

If tests are added in the future, they should ideally follow the `bun test` pattern or standard Jest configuration for n8n nodes.

- **Run Tests (Future)**: `bun test`
- **Run Single Test (Future)**: `bun test <path/to/test-file>`

## 2. Code Style & Conventions

### Formatting Rules

Enforced by Prettier. Run `bun run format` to apply.

- **Indentation**: 2 spaces.
- **Quotes**: Single quotes (`'`) for strings.
- **Semicolons**: Always used at end of statements.
- **Trailing Commas**: ES5/All (multi-line objects/arrays have trailing commas).
- **Line Length**: Follow Prettier default (likely 80 or 100 characters).

### TypeScript Guidelines

- **Strict Mode**: Enabled (`"strict": true` in `tsconfig.json`).
- **Imports**:
  - Use `import type` for interfaces/types.
  - **Ordering**:
    1. External libraries (`n8n-workflow`).
    2. Internal modules (`./resources/...`).
    3. Shared modules (`../../shared/...`).
    4. Environment/Config (`../../env`).
- **Type Definitions**:
  - Prefer `interface` over `type` for object definitions.
  - Explicitly type return values for complex functions.

### Naming Conventions

- **Files**:
  - Node definitions: `PascalCase.node.ts` (e.g., `KeloolaAccounting.node.ts`).
  - Credentials: `PascalCase.credentials.ts`.
  - Resource descriptions: `camelCase.ts` (e.g., `resources/user.ts`).
- **Classes**:
  - PascalCase (e.g., `class KeloolaAccounting`).
- **Functions/Methods**:
  - camelCase (e.g., `execute`, `decodeJwtPayload`).
- **Variables**:
  - camelCase.
- **Constants**:
  - UPPER_SNAKE_CASE (especially for env vars like `ENV.ACCOUNTING_BASE_URL`).

### Error Handling

- **Specific Errors**: Use `NodeOperationError` from `n8n-workflow`.
- **Context**: Always provide the node context (`this.getNode()`) when throwing errors.
  ```typescript
  throw new NodeOperationError(
    this.getNode(),
    'Failed to obtain access token from Keloola Auth API',
  );
  ```
- **HTTP Errors**: Handle API failures gracefully.

## 3. n8n Node Development Patterns

### Node Structure

- **Class Implementation**: Must implement `INodeType`.
- **Description**: Define the `description` property (type `INodeTypeDescription`).
- **Properties**:
  - Use `displayName`, `name`, `icon`, `group`, `version`.
  - **Inputs/Outputs**: Typically `[NodeConnectionTypes.Main]`.
  - **Defaults**: Define `name` in defaults.

### Execution (`execute` method)

- **Signature**: `async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>`
- **Parameters**: Retrieve using `this.getNodeParameter(name, index)`.
- **Credentials**: Retrieve using `this.getCredentials(name)`.
- **State/Cache**: Use `this.getWorkflowStaticData('global')` for caching tokens or state across executions.

### HTTP Requests

- **Helper**: Use `this.helpers.httpRequest` instead of external libraries like Axios.
- **Example**:
  ```typescript
  const response = await this.helpers.httpRequest({
    method: 'GET',
    url: `${ENV.ACCOUNTING_BASE_URL}/user`,
    headers: { Authorization: `Bearer ${token}` },
  });
  ```
- **Return Data**: Wrap response in `this.helpers.returnJsonArray(response)`.

### Credentials

- Defined in `credentials/` folder.
- Must implement `ICredentialType`.
- Reference them in the node description: `credentials: [{ name: 'keloolaApi', required: true }]`.

## 4. Helper & Shared Code

- Shared logic resides in `@repo/support`.
- **Prebuild Distribution**: The `prebuild` script uses `distribute-shared.ts` to copy shared files from `@repo/support/shared` into each workspace's `shared/` directory.
- **Imports**: Always import shared code from the local `../../shared/...` path, NOT directly from `@repo/support` or `node_modules`.
- **Env Generation**: The `support` package handles environment variable generation. Ensure this is respected and used via imports from `../../env` (which maps to the generated file).

## 5. Agent Instructions

- **Modifying Nodes**: When adding a new resource or operation:
  1. Update the `properties` list in the node description.
  2. Update the `execute` method to handle the new resource/operation logic.
  3. Ensure types match `n8n-workflow` interfaces.
- **Refactoring**: If extracting logic, consider if it belongs in the node file or a shared resource file in `resources/`.
- **Safety**: Always check for `null` or `undefined` when dealing with node parameters or API responses before accessing properties.

---

_Last updated by Antigravity on Feb 04 2026_
