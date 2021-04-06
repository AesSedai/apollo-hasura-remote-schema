module.exports = {
    schema: [
        {
            "http://127.0.0.1:8080/v1/graphql": {
                headers: {
                    'X-Hasura-Admin-Secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
                }
            }
        }
    ],
    documents: ["./src/**/*.tsx", "./src/**/*.ts"],
    overwrite: true,
    generates: {
        "./src/graphql/graphql.ts": {
            plugins: [
                "typescript",
                "typescript-operations",
                "typescript-graphql-request"
            ],
            config: {
                skipTypename: false
            }
        },
        "./src/graphql/graphql.schema.json": {
            plugins: ["introspection"]
        },
        "./src/graphql/graphql.schema.graphql": {
            plugins: ["schema-ast"]
        }
    }
}
