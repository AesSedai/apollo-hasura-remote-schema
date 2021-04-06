import { gql } from "graphql-request"

export const types = gql`
    type Query {
        required: Int
    }

    type Mutation {
        user_set_username_via_remote_schema(jwt_uid: String!, username: String!): users!
    }
`
