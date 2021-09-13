import { hasuraRequest } from "./base"
import { printSchema } from "graphql"
import { loadSchema } from "@graphql-tools/load"
import { UrlLoader } from "@graphql-tools/url-loader"
import { wrapSchema, FilterTypes, FilterObjectFields, FilterRootFields } from "@graphql-tools/wrap"
import { mergeTypeDefs } from "@graphql-tools/merge"
import { pruneSchema } from "@graphql-tools/utils"
import { hasOwnProperty } from "../../../utils/hasOwnProperty"

const roles = {
    user: {
        Query: ["required"],
        Mutation: [
            "user_set_username_via_remote_schema"
        ],
        Subscription: [""]
    }
}

const aggregateFields = [
    "aggregate",
    "max_fields",
    "min_fields",
    "avg_fields",
    "stddev",
    "sum_fields",
    "variance_fields",
    "var_samp",
    "var_pop"
]

if (process.env.SERVER_LOCAL_URL != null && process.env.HASURA_REMOTE_SCHEMA_NAME != null) {
    hasuraRequest({
        type: "export_metadata",
        version: 2,
        args: {}
    }).then(async (response) => {
        const tables = response.metadata.sources[0].tables

        // console.log("tables", JSON.stringify(permissions, null, 2))
        const schema = await loadSchema(process.env.SERVER_LOCAL_URL!, { loaders: [new UrlLoader()] })

        // grab schema roots to keep
        const roots: string[] = [schema.getQueryType(), schema.getMutationType()]
            .filter((type) => type != null)
            .map((type) => type!.toString())

        // types to keep from the first pass: roots, allow-listed root operations, and root operation arguments
        const typesToKeep: Set<string> = new Set([...roots])

        Object.entries(roles).forEach(async ([roleName, allowedOps]) => {
            const permissions = tables
                .filter((table: any) => {
                    return table?.select_permissions?.find((permission: any) => permission.role === roleName)
                })
                .reduce((acc: any, table: any) => {
                    const columns =
                        table?.select_permissions?.find((permission: any) => permission.role === roleName)?.permission
                            ?.columns ?? []

                    const objectRelations = table?.object_relationships?.map((o: any) => o.name) ?? []
                    const arrayRelations = table?.array_relationships?.map((o: any) => o.name) ?? []
                    acc[table.table.name] = [...columns, ...objectRelations, ...arrayRelations]
                    return acc
                }, {})

            // console.log('permissions', permissions)

            // remove aggregate fields and collect root operation and argument types to keep
            const filteredSchema = wrapSchema({
                schema: schema,
                transforms: [
                    new FilterTypes((type) => {
                        return !aggregateFields.some((field) => type.toString().includes(field))
                    }),
                    new FilterRootFields((operationName, fieldName, fieldConfig) => {
                        if (operationName != null && hasOwnProperty(allowedOps, operationName)) {
                            if (allowedOps[operationName]?.includes(fieldName!)) {
                                if (fieldConfig != null) {
                                    typesToKeep.add(fieldConfig.type.toString().replace("!", ""))
                                    Object.entries(fieldConfig?.args ?? {}).forEach(([key, arg]) => {
                                        typesToKeep.add(arg.type.toString().replace(/(!|\[|\])/g, ""))
                                    })
                                    return true
                                }
                                return false
                            }
                            return false
                        }
                        return false
                    })
                ]
            })

            // get type definitions. Apparently `schema` doesn't have the actual definitions, but this does.
            const filteredSchemaTypes = mergeTypeDefs([filteredSchema])

            // recursively dig into a type and get the return type name
            const digTypeName = (type: any): any => {
                if (type?.name?.value != null) {
                    return type.name.value
                } else if (type?.type) {
                    return digTypeName(type.type)
                } else {
                    return null
                }
            }

            // make a dictionary of { type: {relation: type return] }. Eg:
            // {
            //   mining_spaces: {
            //     character: 'characters',
            //     character_id: 'uuid',
            //     created_at: 'timestamptz',
            //     health: 'Int',
            //     id: 'uuid',
            //     item: 'items',
            //     item_id: 'uuid',
            //     max_health: 'Int',
            //     ore_material: 'item_material_types_enum',
            //     position: 'Int',
            //     updated_at: 'timestamptz'
            //   }
            // }
            const typeDefs = filteredSchemaTypes.definitions.reduce<{ [K in any]: any }>((acc, def: any) => {
                if (def?.name?.value != null && def?.fields?.length > 0) {
                    acc[def.name.value] = def.fields.reduce((a2: any, field: any) => {
                        if (field?.name?.value != null) {
                            a2[field.name.value] = digTypeName(field.type)
                        }
                        return a2
                    }, {})
                }
                return acc
            }, {})

            // recursively get every type down to scalars that is included in the type's relations
            // character_name_available_result => { "Boolean" }
            const recurseTypes = (types: any, current: Set<any>, target: any): Set<any> => {
                if (types[target] == null) {
                    current.add(target)
                    return current
                } else {
                    Object.values(types[target]).forEach((type) => {
                        if (!current.has(type)) {
                            current.add(type)
                            current = recurseTypes(types, current, type)
                        }
                    })
                }

                return current
            }

            // generate the final set of types to keep
            // include the original typesToKeep, and recurse over each of those to get valid subtypes
            const keeping = new Set([
                ...Array.from(typesToKeep)
                    .map((type) => {
                        return Array.from(recurseTypes(typeDefs, new Set([]), type))
                    })
                    .flat(),
                ...Array.from(typesToKeep)
            ])

            const finalSchema = wrapSchema({
                schema: filteredSchema,
                transforms: [
                    // final list of allowed types
                    new FilterTypes((type) => {
                        if (keeping.has(type.toString())) {
                            return true
                        }
                        return false
                    }),
                    // handle allowed permissions, remove if permission not available in hasura
                    new FilterObjectFields((typeName, fieldName, fieldConfig) => {
                        if (typeName != null) {
                            if (permissions[typeName] != null) {
                                return permissions[typeName].includes(fieldName)
                            }
                        }
                        return true
                    })
                ]
            })

            // remove following directive:
            // """whether this query should be cached (Hasura Cloud only)"""
            // directive @cached(
            //     """measured in seconds"""
            //     ttl: Int! = 60

            //     """refresh the cache entry"""
            //     refresh: Boolean! = false
            // ) on QUERY

            // also remove extra newlines, and docstrings
            const printed = printSchema(pruneSchema(finalSchema))
                .replace(/\"\"\"whether(.|\n)+?QUERY\n/g, "")
                .replace(/\"\"\"(.|\n)+?\"\"\"/g, "")
                .replace(/\n\s+?\n/g, "\n")

            try {
                await hasuraRequest({
                    type: "drop_remote_schema_permissions",
                    args: {
                        remote_schema: process.env.HASURA_REMOTE_SCHEMA_NAME,
                        role: roleName
                    }
                })
            } catch (err) {
                // permissions aren't present, just pass
            }

            await hasuraRequest({
                type: "add_remote_schema_permissions",
                args: {
                    remote_schema: process.env.HASURA_REMOTE_SCHEMA_NAME,
                    role: roleName,
                    definition: {
                        schema: printed
                    }
                }
            })
        })
    })
} else {
    console.log("process.env.SERVER_LOCAL_URL is empty or process.env.HASURA_REMOTE_SCHEMA_NAME is empty")
}
