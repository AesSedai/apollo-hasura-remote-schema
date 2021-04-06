import { gql } from "graphql-request"

// prettier-ignore
gql`
mutation updateUsername($jwt_uid: String!, $username: String!) {
    update_users(where: {jwt_uid: {_eq: $jwt_uid}}, _set: {username: $username}) {
        returning {
            id
            jwt_uid
            username
            created_at
            updated_at
        }
  }
}        
`
