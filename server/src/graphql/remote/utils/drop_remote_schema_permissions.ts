import { hasuraRequest } from "./base"

if (process.env.HASURA_REMOTE_SCHEMA_NAME != null) {
    hasuraRequest({
        type: "drop_remote_schema_permissions",
        args: {
            remote_schema: process.env.HASURA_REMOTE_SCHEMA_NAME,
            role: "user"
        }
    })
} else {
    console.log("process.env.HASURA_REMOTE_SCHEMA_NAME is empty")
}
