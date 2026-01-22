# E-commerce Monorepo

This repository contains the source code for a modern e-commerce platform, structured as a monorepo using pnpm workspaces and Turbo.

## Monorepo Structure

The repository is organized into two main directories: `apps` and `packages`.

- `apps`: Contains the different applications that make up the e-commerce platform.
- `packages`: Contains shared code, configurations, and utilities used by the applications.

This structure is defined in the `pnpm-workspace.yaml` file:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Applications

- **api-gateway**: The main entry point for all incoming API requests. It routes requests to the appropriate microservice.
- **catalog**: Manages the product catalog.
- **identity**: Handles user authentication, authorization, and user-related information.
- **orders**: Manages customer orders.

### Packages

- **common**: A shared package containing common code such as error handlers, middlewares, types, and utility functions.
- **database-config**: Contains shared database configurations.
- **tsconfig**: Contains the base TypeScript configuration for the entire monorepo.

## Build System

This monorepo uses [Turborepo](https://turbo.build/) to manage the build process. The build pipeline is defined in `turbo.json`. The main scripts are:

- `pnpm build`: Builds all the applications and packages.
- `pnpm dev`: Runs all the applications in development mode.
- `pnpm lint`: Lints the codebase.

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

## TypeScript Configuration

The project uses TypeScript for type safety. The configuration is split into a base configuration and application-specific configurations.

### Base Configuration

The base TypeScript configuration is located at `packages/tsconfig/base.json`. It provides a solid foundation for all the other `tsconfig.json` files in the monorepo.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "composite": true
  }
}
```

### Application Configurations

Each application and package has its own `tsconfig.json` file that extends the base configuration. This allows for specific configurations for each part of the monorepo.

#### `apps/api-gateway/tsconfig.json`

```json
{
  "extends": "../../packages/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "typeRoots": ["./node_modules/@types", "../../packages/common/src/types"]
  },
  "include": ["src/**/*"]
}
```

This configuration specifies that the output directory is `dist`, the root directory for source files is `src`, and it includes custom type definitions from the `common` package.

#### `apps/identity/tsconfig.json`

```json
{
  "extends": "../../packages/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "typeRoots": [
      "./node_modules/@types",
      "../../packages/common/src/types",
      "./src/types"
    ]
  },
  "include": ["src/**/*"]
}
```

Similar to the `api-gateway`, this configuration sets the output and root directories. It also includes type definitions from the `common` package and its own `src/types` directory.

#### `packages/common/tsconfig.json`

```json
{
  "extends": "../../packages/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

This is a straightforward extension of the base configuration, setting the output and root directories for the `common` package.

uploads/user-profile/j4rKZSmvgc3gCaQpHJrTenVdHBlKtL4Y/1768734514868-36205.webp
uploads/user-profile/j4rKZSmvgc3gCaQpHJrTenVdHBlKtL4Y/1768734662943-64598.webp
