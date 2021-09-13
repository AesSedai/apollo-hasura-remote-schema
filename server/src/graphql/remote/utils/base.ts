import axios from "axios"

export const hasuraRequest = async (data: any): Promise<any> => {
    const p = new Promise<void>(async (resolve, reject) => {
        if (process.env.HASURA_METADATA_LOCAL_URL != null && process.env.HASURA_GRAPHQL_ADMIN_SECRET != null) {
            axios
                .post(process.env.HASURA_METADATA_LOCAL_URL!, data, {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Hasura-Role": "admin",
                        "X-Hasura-Admin-Secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET
                    }
                })
                .then((response) => {
                    if (response.data?.errors == null) {
                        console.log("success")
                        resolve(response.data)
                    } else {
                        console.log("error\n", JSON.stringify(response.data, null, 2))
                        reject(response.data)
                    }
                })
                .catch((err) => {
                    console.log("error\n", JSON.stringify(err.response.data, null, 2))
                    reject(err.response.data)
                })
        } else {
            if (process.env.HASURA_METADATA_LOCAL_URL == null) {
                console.log("error, process.env.HASURA_METADATA_LOCAL_URL is empty")
            }
            if (process.env.HASURA_GRAPHQL_ADMIN_SECRET == null) {
                console.log("error, process.env.HASURA_GRAPHQL_ADMIN_SECRET is empty")
            }
            reject()
        }
    })
    return p
}
