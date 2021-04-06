## Purpose
The point of this sample is to demonstrate a full example of automatically importing the schema types from Hasura into a remote schema, to allow usage of Hasura types in a remote schema.

This is accomplished using the `graphql-codegen` package. See "Points of Interest" below for specifics.

## Architecture
```
├── hasura                          - metadata and databse definitions for hasura container
│   ├── metadata
│   ├── migrations
│   └── seeds
├── migrations                      - knex-based migration definitions
│   ├── migrations
│   └── seeds
└── server                          - apollo-server backend, proxied to with graphql from hasura and remote schema stitching back
    └── src
        ├── exceptions
        ├── graphql
        │   ├── local               - apollo-server graphql schema, types, and resolvers
        │   │   └── resolvers
        │   └── remote              - remote hasura graphql operations
        │       ├── mutations
        │       └── queries
        ├── middlewares
        ├── services                - functionality pertaining to local/resolvers implementations, does the heavy lifting for custom apollo-server resolvers
        └── utils
```

## Points of Interest
For a minimum setup to include automatic schema codegen (assuming you have an apollo-server instance already), look at the following files:
```
Codegen:
server/package.json          - includes `run` commands for graphql-codegen
server/codegen-remote.yml    - Hasura graphql config
server/codegen-local.yml     - Apollo-server graphql config
server/codegen.js            - Custom loader to remove the [query/mutation/subscription]_root and schema type definitions from the hasura schema

Custom remote schema types:
server/src/graphql/local/localTypes.ts                 - Your apollo-server operations that will get merged into Hasura. NOTE: at least one `Query` operation is required
server/src/graphql/local/graphql.schema-remote.graphql - Hasura schema, stripped of the root and schema types (generated by codegen-remote.yml)
server/src/graphql/local/graphql.schema.graphql        - Apollo-server schema, incorporating stripped Hasura schema types

Custom resolvers:
server/src/graphql/local/resolvers/usersResolvers.ts   - Custom resolver for mutation seen in localTypes.ts above

Custom services (optional, depending on how one wishes to implement their resolvers):
server/src/services/users.service.ts                   - Service pattern for delegating actual resolver business logic

Apollo-server config:
server/src/app.ts             - Imports and merges types and resolvers. See initializeApollo()
```

Generating graphql TS types:
```
$ cd server
$ npm run generate                    # generate local and remote
$ npm run generate-l                  # generate local
$ npm run generate-r                  # generate remote
```

!!After updating the apollo-server schema, be sure to reload the remote schema in Hasura!!

## Full Setup

Setup ENV
```
$ cp .env.sample .env
```
Customize values as required.

Install required software:
```
$ install docker and docker-compose (depends on system)
```

Setup containers and volumes:
```
$ sudo docker-compose build
$ sudo docker-compose volume create db
```

Start postgres first:
```
$ sudo docker-compose up db
```

Setup database:
```
$ cd migrations
$ npm install
$ npx knex migrate:latest
$ npx knex seed:run --specific=seed_user.js
```

Ctrl+c docker-compose and start up everything:
```
$ sudo docker-compose up
```

Import the hasura metadata:
```
# install hasura CLI
$ curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
$ cd hasura
$ hasura metadata appy --admin-secret <hasura_admin_secret>
```
