# Keloola n8n Nodes

This monorepo contains a collection of custom n8n nodes for integrating with Keloola's services. It is managed using [Turborepo](https://turbo.build/repo) and [Bun](https://bun.sh/).

## 📦 Packages

| Package | Description | Version |
| h | h | h |
| `n8n-nodes-keloola-accounting` | Integration for Keloola Accounting API | 0.1.0 |
| `@repo/support` | Shared utilities and build tools | 0.0.0 |

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
   This step is crucial as it generates the necessary `env.ts` files for the nodes.

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

- `bun run prebuild`: Generate environment files for all workspaces.
- `bun run build`: Build all packages.
- `bun run dev`: Run build in watch mode.
- `bun run lint`: Lint all packages.
- `bun run format`: Format code with Prettier.
- `bun run clean`: Clean build artifacts.

## 🤝 Contributing

1. Adhere to the code style (Prettier & ESLint).
2. See [AGENTS.md](./AGENTS.md) for detailed development guidelines and conventions.
