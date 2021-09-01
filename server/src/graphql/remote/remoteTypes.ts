import { readFileSync } from "fs"

export const types = readFileSync("./src/graphql/remote/graphql.schema.graphql", { encoding: "utf-8" })
