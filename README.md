# Keloola n8n Nodes

This monorepo contains a collection of custom n8n nodes for integrating with Keloola's services. It is managed using [Turborepo](https://turbo.build/repo) and [Bun](https://bun.sh/).

## 📦 Packages

| Package                             | Description                                 | Version |
| ----------------------------------- | ------------------------------------------- | ------- |
| `n8n-nodes-keloola-accounting`      | Integration for Keloola Accounting API      | 0.2.4   |
| `n8n-nodes-keloola-accounting-saas` | Integration for Keloola Accounting SaaS API | 0.2.3   |
| `@repo/support`                     | Shared utilities and build tools            | 0.0.0   |

## 🛠 Prerequisites

- **Bun**: v1.3.5 or higher
- **Node.js**: v18 or higher
- **n8n**: Installed locally for development testing

## 🚀 Getting Started

1. **Install Dependencies**

   ```bash
   bun install
   ```

2. **Generate Environment Files**
   This step is crucial as it generates the necessary `env.ts` files and copies shared code (`shared/`) for the nodes.

   ```bash
   bun run prebuild
   ```

3. **Build All Nodes**
   ```bash
   bun run build
   ```

## 👨‍💻 Development

### Watch Mode

To run the build in watch mode for development:

```bash
bun run dev
```

### Linking to n8n

To test these nodes in your local n8n instance:

1. Go to the specific node directory:
   ```bash
   cd n8n-nodes-keloola-accounting
   ```
2. Link the package:
   ```bash
   bun link
   ```
3. In your n8n configuration directory (usually `~/.n8n/custom`):
   ```bash
   bun link n8n-nodes-keloola-accounting
   ```

Alternatively, you can use the provided script to link all nodes (verify path logic first):

```bash
bun run link:nodes
```

## 📜 Scripts

- `bun run prebuild`: Generate environment files and copy shared resources.
- `bun run build`: Build all packages using Turborepo.
- `bun run dev`: Run build in watch mode across all packages.
- `bun run lint`: Lint all packages (runs prebuild first).
- `bun run lint:fix`: Automatically fix linting issues.
- `bun run format`: Format all TypeScript files with Prettier.
- `bun run check-types`: Run TypeScript type checking.
- `bun run full-build`: One-stop command to format, lint, build, and link nodes.
- `bun run n8n`: Run a full build and then start the local n8n instance.
- `bun run link:nodes`: Link all built nodes to your local n8n installation.
- `bun run clean`: Clean build artifacts.
- `bun run clean:all`: Clean all build artifacts and `node_modules`.

## 🧪 Testing

### Development Workflow
We maintain a test workflow in `dev-workflow.json`. You can import this file directly into n8n to test all implemented resources (Journal, Product, Settings, Payments, Down Payments, etc.) in a real environment.

1.  Open n8n.
2.  Click on **Workflows** > **Import from File...**
3.  Select `dev-workflow.json`.
4.  Ensure your **Keloola Authentication** credentials are set up.

## 🤝 Contributing

1.  **Code Style**: Adhere to Prettier and ESLint rules.
2.  **Guidelines**: See [AGENTS.md](./AGENTS.md) for detailed development conventions.
3.  **Versioning**: Use `bun run changeset` to document changes and `bun run version-packages` to update versions.
