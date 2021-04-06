declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production"
            PORT?: string
            HASURA_GRAPHQL_ADMIN_SECRET: string
            HASURA_GRAPHQL_URL?: string
            HASURA_GRAPHQL_LOCAL_URL?: string
            GOOGLE_APPLICATION_CREDENTIALS: string
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
