import { typeDefs } from "./typeDefs";
import dotenv from "dotenv";
import resolvers from "./resolvers";
dotenv.config();
import createClient from "./postgres-client";
import createRepositories from "./postgres-repositories";
import createService from "./services";
import { ApolloServerExpressConfig } from "apollo-server-express";

const client = createClient();
const repositories = createRepositories(client);
const services = createService(repositories);

export const option: ApolloServerExpressConfig = {
  typeDefs,
  resolvers,
  context: () => {
    return { services };
  },
  introspection: true
};