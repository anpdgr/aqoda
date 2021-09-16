import { ApolloServer, gql } from "apollo-server";
import typeDefs from "./schema";
import dotenv from "dotenv";
import resolvers from "./resolvers";
dotenv.config();
import createPrismaClient from "./prisma-client";
import createRepositories from "./prisma-repositories";
import createService from "./services";

const client = createPrismaClient();
const repositories = createRepositories(client);
const services = createService(repositories);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { services };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
