import { ApolloServer } from "apollo-server";
import dotenv from "dotenv";
dotenv.config();
import { option } from "./createApolloOption";

export const server = new ApolloServer(option);