import { gql } from "graphql-request"

export const types = gql`
    schema {
        query: query_root
        mutation: mutation_root
        subscription: subscription_root
    }

    type query_root {
        required: Int
    }

    type mutation_root {
        user_set_username_via_remote_schema(jwt_uid: String!, username: String!): users!
    }

    type subscription_root {
        required: Int
    }    
`
