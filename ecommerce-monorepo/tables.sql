[1G[0K[1m[31mError: [39m[22m
`--to-schema-datamodel` was removed. Please use `--[from/to]-schema` instead.

[1mUsage[22m

  [2m$[22m prisma migrate diff [options]

[1mOptions[22m

  -h, --help               Display this help message
  --config                 Custom path to your Prisma config file
  -o, --output             Writes to a file instead of stdout

[3mFrom and To inputs (1 `--from-...` and 1 `--to-...` must be provided):[23m
  --from-empty             Flag to assume from or to is an empty datamodel
  --to-empty

  --from-schema            Path to a Prisma schema file, uses the [3mdatamodel[23m for the diff
  --to-schema

  --from-migrations        Path to the Prisma Migrate migrations directory
  --to-migrations

  --from-config-datasource Flag to use the datasource from the Prisma config file
  --to-config-datasource

[1mFlags[22m

  --script                 Render a SQL script to stdout instead of the default human readable summary (not supported on MongoDB)
  --exit-code              Change the exit code behavior to signal if the diff is empty or not (Empty: 0, Error: 1, Not empty: 2). Default behavior is Success: 0, Error: 1.

[1G[0K\[1G[0K