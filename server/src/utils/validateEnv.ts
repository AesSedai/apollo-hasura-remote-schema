import { cleanEnv, port, str } from "envalid"

const validateEnv = () => {
    cleanEnv(process.env, {
        NODE_ENV: str(),
        PORT: port(),
        HASURA_GRAPHQL_ADMIN_SECRET: str()
    })
}

export default validateEnv
