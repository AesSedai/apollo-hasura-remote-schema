import { hasuraRequest } from "./base"

if (process.env.SERVER_URL != null && process.env.HASURA_REMOTE_SCHEMA_NAME != null) {
    hasuraRequest({
        type: "add_remote_schema",
        args: {
            name: process.env.HASURA_REMOTE_SCHEMA_NAME,
            definition: {
                url: process.env.SERVER_URL,
                headers: [{ name: "X-Server-Request-From", value: "Hasura" }],
                forward_client_headers: true,
                timeout_seconds: 60
            }
        }
    })
} else {
    console.log("process.env.SERVER_URL is empty or process.env.HASURA_REMOTE_SCHEMA_NAME is empty")
}
