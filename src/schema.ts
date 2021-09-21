import { gql } from "apollo-server";

export default gql`
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

  input CreateHotelInput {
    floor: Int!
    roomPerFloor: Int!
  }
  type MutationResult {
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
    keycards: String
  }

  input CheckoutRoomInput {
    keycard: Int!
    guestName: String!
  }

  input CheckoutRoomsByFloorInput {
    floor: Int!
  }

  type Query {
    listAvailableRooms: [Room!]!
    listGuests: String!
    listGuestsNameByAge(operation: String!, guestAge: Int!): String!
    listGuestsNameByFloor(floor: Int!): String!
    getGuestInRoom(roomNumber: String!): String
  }

  type Mutation {
    createHotel(input: CreateHotelInput!): MutationResult!
    bookRoom(input: BookRoomInput!): BookRoomResult!
    bookRoomsByFloor(input: BookRoomsByFloorInput!): BookRoomsByFloorResult!
    checkoutRoom(input: CheckoutRoomInput!): MutationResult!
    checkoutRoomsByFloor(input: CheckoutRoomsByFloorInput!): MutationResult!
  }
`;


