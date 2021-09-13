import { hasuraRequest } from "./base"

if (process.env.HASURA_REMOTE_SCHEMA_NAME != null) {
    hasuraRequest({
        type: "remove_remote_schema",
        args: {
            name: process.env.HASURA_REMOTE_SCHEMA_NAME
        }
    })
} else {
    console.log("process.env.HASURA_REMOTE_SCHEMA_NAME is empty")
}
