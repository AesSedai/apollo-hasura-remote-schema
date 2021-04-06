import { sdk } from "../utils/gqlClient"
import { MutationUser_Set_Username_Via_Remote_SchemaArgs, Users } from "../graphql/local/graphql"
import HttpException from "../exceptions/HttpException"

class UserService {
    // custom business logic would go here
    public async setUsername(args: MutationUser_Set_Username_Via_Remote_SchemaArgs): Promise<Users> {

        // publish update mutation to hasura
        const updated = await sdk.updateUsername({jwt_uid: args.jwt_uid, username: args.username})

        // get result, throw an error if it failed
        const result = updated?.update_users?.returning[0]
        if (result !== undefined) {
            return result
        } else {
            throw new HttpException(400, "Something went wrong");
        }
    }
}

export default UserService
