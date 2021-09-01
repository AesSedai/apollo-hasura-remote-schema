import { ApolloServer, makeExecutableSchema } from "apollo-server-express"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import hpp from "hpp"
import morgan from "morgan"
import compression from "compression"
import errorMiddleware from "./middlewares/error.middleware"
import { logger, stream } from "./utils/logger"
import { types as local } from "./graphql/local/localTypes"
import { types as remote } from "./graphql/remote/remoteTypes"
import { resolvers } from "./graphql/local/resolvers"
import { FilterTypes, wrapSchema } from "@graphql-tools/wrap"
import { mergeTypeDefs } from "@graphql-tools/merge"

class App {
    public server!: ApolloServer
    public app: express.Application
    public port: string | number
    public env: string

    constructor() {
        this.app = express()
        this.port = process.env.PORT || 3000
        this.env = process.env.NODE_ENV || "development"

        this.initializeMiddlewares()
        this.initializeErrorHandling()
        this.initializeApollo(this.app)
    }

    public listen() {
        this.app.listen(this.port, () => {
            logger.info(`🚀 App listening on the port ${this.port}`)
        })
    }

    public getServer() {
        return this.app
    }

    private initializeApollo(app: express.Application) {
        const wrappedRemoteSchema = wrapSchema({
            schema: makeExecutableSchema({
                typeDefs: remote
            }),
            transforms: [
                new FilterTypes((type) => {
                    if (type.toString().includes("root")) {
                        return false
                    }
                    return true
                })
            ]
        })

        this.server = new ApolloServer({
            schema: makeExecutableSchema({
                typeDefs: mergeTypeDefs([local, wrappedRemoteSchema]),
                resolvers: resolvers
            }),
            context: ({ req }) => ({
                user_id: req.headers["x-hasura-user-id"],
                role: req.headers["x-hasura-role"]
            })
        })
        // this call doesn't like using { this.app } in constructor, so moving it into a separate fn makes it work
        this.server.applyMiddleware({ app })
    }

    private initializeMiddlewares() {
        if (this.env === "production") {
            this.app.use(morgan("combined", { stream }))
            this.app.use(cors({ origin: "your.domain.com", credentials: true }))
        } else if (this.env === "development") {
            this.app.use(morgan("dev", { stream }))
            this.app.use(cors({ origin: true, credentials: true }))
        }

        this.app.use(hpp())
        this.app.use(helmet())
        this.app.use(compression())
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(cookieParser())
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware)
    }
}

export default App
