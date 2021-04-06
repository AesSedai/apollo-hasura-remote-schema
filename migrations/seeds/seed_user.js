exports.seed = async function (knex) {
    await knex("users").del()
    await knex("users").insert([{ username: "Test user", jwt_uid: "abcdefghijklmnop" }])
}
