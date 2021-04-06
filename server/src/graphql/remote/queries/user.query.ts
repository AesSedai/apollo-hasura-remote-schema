import { gql } from "graphql-request"

gql`
query getUser($user_id: uuid!) {
    users(where: { id: { _eq: $user_id } }) {
        id
    }
}
`

gql`
query getUserByJwtUid($jwt_uid: String!) {
    users(where: { jwt_uid: { _eq: $jwt_uid } }) {
        id
    }
}
`
