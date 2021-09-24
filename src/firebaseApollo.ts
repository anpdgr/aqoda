import { ApolloServer } from 'apollo-server-cloud-functions';
import { option } from "./createApolloOption";
import * as functions from "firebase-functions";

const server = new ApolloServer(option);

export const graphql = functions.https.onRequest(server.createHandler() as any);