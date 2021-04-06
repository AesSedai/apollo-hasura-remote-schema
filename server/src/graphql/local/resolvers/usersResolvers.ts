import { Resolvers } from "../graphql"
import userService from "../../../services/users.service"

const u = new userService()

const users: Resolvers = {
    Mutation: {
        user_set_username_via_remote_schema: async (root, args, context, info) => {
            const updatedUser = await u.setUsername(args)
            return updatedUser
        }
    }
}

export default users
