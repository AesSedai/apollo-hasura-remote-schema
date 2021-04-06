const { onUpdateTrigger } = require("../knexfile")

exports.up = async (knex) => {
    await knex.schema.createTable("users", function (table) {
        table.uuid("id").defaultTo(knex.raw("uuid_generate_v4()")).primary()
        table.string("jwt_uid").notNullable().index().unique()
        table.string("username").notNullable().index().unique()
        table.timestamps(true, true)
    })
    await knex.raw(onUpdateTrigger("users"))
}

exports.down = async (knex) => {
    await knex.schema.dropTable("users")
}
