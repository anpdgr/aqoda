import { ApolloServer, gql } from 'apollo-server';
import dotenv from "dotenv";
import { ApplicationError } from './error';
import { Guest, Room } from './model';
dotenv.config();
import createPrismaClient from "./prisma-client";
import createRepositories from "./prisma-repositories";
import createService from "./services";

const client = createPrismaClient();
const repositories = createRepositories(client);
const services = createService(repositories);

const typeDefs = gql`
  type Room {
    roomNumber: String!
    floor: Int!
    keycard: Int
    guest: Guest
  }

  type Guest {
    name: String!
    age: Int!
  }

  type Query {
    listAvailableRooms: [Room!]!
    listGuests: String!
    listGuestsNameByAge(operation: String!, guestAge: Int!): String!
    listGuestsNameByFloor(floor: Int!): String!
    getGuestInRoom(roomNumber: String!): String
  }

  input createHotelInput {
    floor: Int!
    roomPerFloor: Int!
  }
  type NoValueReturnResult {
    code: String!
    success: Boolean!
    message: String!
  }

  input GuestInput {
    name: String!
    age: Int!
  }
  input BookRoomInput {
    roomNumber: String!
    guest: GuestInput!
  }
  type BookRoomResult {
    code: String!
    success: Boolean!
    message: String!
    keycard: Int
  }

  input BookRoomsByFloorInput {
    floor: Int!
    guest: GuestInput!
  }
  type BookRoomsByFloorResult {
    code: String!
    success: Boolean!
    message: String!
    bookedRooms: [Room!]
    keycards: String!
  }

  input CheckoutRoomInput {
    keycard: Int!
    guestName: String!
  }

  input checkoutRoomsByFloorInput {
    floor: Int!
  }

  type Mutation {
    createHotel(input: createHotelInput!): NoValueReturnResult!
    bookRoom(input: BookRoomInput!): BookRoomResult!
    bookRoomsByFloor(input: BookRoomsByFloorInput!): BookRoomsByFloorResult!
    checkoutRoom(input: CheckoutRoomInput!): NoValueReturnResult!
    checkoutRoomsByFloor(input: checkoutRoomsByFloorInput!): NoValueReturnResult!
  }
`;

const resolvers = {
  Query: {
    listAvailableRooms: async (root: any, args: any, context: any, info: any) => {
      const availableRooms = await context.services.listAvailableRooms();
      return availableRooms;
    },
    //error
    listGuests: async (root: any, args: any, context: any, info: any) => {
      const guests = Array.from(
        new Set(
          (await context.services.listGuests()).map((guest: Guest) => guest.name)
        )
      ).join(", ");
      return guests;
    },
    listGuestsNameByAge: async (root: any, args: any, context: any, info: any) => {
      const guestsByAge = (await context.services.listGuestsNameByAge(args.operation, args.guestAge)).join(", ");
      return guestsByAge;
    },
    listGuestsNameByFloor: async (root: any, args: any, context: any, info: any) => {
      const guestsByAge = (await context.services.listGuestsNameByFloor(args.floor)).join(", ");
      return guestsByAge;
    },
    getGuestInRoom: async (root: any, args: any, context: any, info: any) => {
      const result = await context.services.getRoomByRoomNumber(args.roomNumber);
      return result.guest.name;
    }
  },
  Mutation: {
    createHotel: async (root: any, {input}: any, context: any, info: any) => {
      try {
        await context.services.createHotel(input.floor, input.roomPerFloor);
        return {
          code: "200",
          success: true,
          message: `Hotel created with ${input.floor} floor(s), ${input.roomPerFloor} room(s) per floor.`
        }
      } catch (error) {
        if (error instanceof ApplicationError) {
          return {  
            code: error.code ?? "500",
            success: false,
            message: error.message
          }
        }
        throw error;
      }
    },
    bookRoom: async (root: any, {input}: any, context: any, info: any) => {
      try {
        const keycard = await context.services.book(input.roomNumber, input.guest);
        return {
          code: "200",
          success: true,
          message: `Room ${input.roomNumber} is booked by ${input.guest.name} with keycard number ${keycard}.`,
          keycard
        }
      } catch (error) {
        if (error instanceof ApplicationError) {
          return {  
            code: error.code ?? "500",
            success: false,
            message: error.message
          }
        }
        throw error;
      }
    },
    bookRoomsByFloor: async (root: any, {input}: any, context: any, info: any) => {
      try {
        const bookedRooms = await context.services.bookByFloor(input.floor, input.guest);
        const rooms = bookedRooms.map((room: Room) => room.roomNumber).join(", ");
        const keycardNumbers = bookedRooms.map((room: Room) => room.keycardNumber).join(", ");
        return {
          code: "200",
          success: true,
          message: `Room ${rooms} are booked with keycard number ${keycardNumbers}`,
          bookedRooms: bookedRooms,
          keycards: keycardNumbers
        }
      } catch (error) {
        if (error instanceof ApplicationError) {
          return {  
            code: error.code ?? "500",
            success: false,
            message: error.message
          }
        }
        throw error;
      }
    },
    checkoutRoom: async (root: any, {input}: any, context: any, info: any) => {
      try {
        const updatedRoom = await context.services.checkout(input.keycard, input.guestName);
        return {
          code: "200",
          success: true,
          message: `Room ${updatedRoom.roomNumber} is checkout.`
        }
      } catch (error) {
        if (error instanceof ApplicationError) {
          return {  
            code: error.code ?? "500",
            success: false,
            message: error.message
          }
        }
        throw error;
      }
    },
    checkoutRoomsByFloor: async (root: any, {input}: any, context: any, info: any) => {
      try {
        const updatedRoom = await context.services.checkoutGuestByFloor(input.floor);
        const roomNumbersOnFloor = updatedRoom
          .map((room: Room) => room.roomNumber)
          .join(", ");
        return {
          code: "200",
          success: true,
          message: `Room ${roomNumbersOnFloor} is checkout.`
        }
      } catch (error) {
        if (error instanceof ApplicationError) {
          return {  
            code: error.code ?? "500",
            success: false,
            message: error.message
          }
        }
        throw error;
      }
    }
  }
};


const server = new ApolloServer({ typeDefs, resolvers, context: () => {
  return {services}
} });


server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
