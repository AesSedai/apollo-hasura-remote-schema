const { buildSchema } = require("graphql")
const { readFileSync } = require("fs")

module.exports = function (schemaString, config) {
    // Your logic for loading your GraphQLSchema
    const str = readFileSync(schemaString, { encoding: "utf-8" })
    const replaced = str
        .replace(/schema {[\w:\s]*}/, "")
        .replace(/type mutation_root { {[\w:\s]*}/, "")
        .replace(/type query_root { {[\w:\s]*}/, "")
        .replace(/type subscription_root { {[\w:\s]*}/, "")
    return buildSchema(replaced)
}
