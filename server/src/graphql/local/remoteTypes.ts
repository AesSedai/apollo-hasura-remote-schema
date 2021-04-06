import { readFileSync } from "fs"

export const types = readFileSync("./src/graphql/local/graphql.schema-remote.graphql", { encoding: "utf-8" })
