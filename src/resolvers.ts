import { ApplicationError } from "./error";
import { Resolvers } from "./generated/graphql";
import { Guest, Room } from "./model";

const resolvers: Resolvers = {
  Query: {
    listAvailableRooms: async (
      root,
      args,
      context,
      info
    ) => {
      const availableRooms = await context.services.listAvailableRooms();
      return availableRooms;
    },
    listGuests: async (root, args, context, info) => {
      const guests = Array.from(
        new Set(
          (await context.services.listGuests()).map(
            (guest: Guest) => guest.name
          )
        )
      ).join(", ");
      return guests;
    },
    listGuestsNameByAge: async (
      root,
      args,
      context,
      info
    ) => {
      const guestsByAge = (
        await context.services.listGuestsNameByAge(
          args.operation,
          args.guestAge
        )
      ).join(", ");
      return guestsByAge;
    },
    listGuestsNameByFloor: async (
      root,
      args,
      context,
      info
    ) => {
      const guestsByAge = (
        await context.services.listGuestsNameByFloor(args.floor)
      ).join(", ");
      return guestsByAge;
    },
    getGuestInRoom: async (root, args, context, info) => {
      const result = await context.services.getRoomByRoomNumber(
        args.roomNumber
      );
      return result?.guest?.name;
    },
  },
  Mutation: {
    createHotel: async (root, { input }, context, info) => {
      try {
        await context.services.createHotel(input.floor, input.roomPerFloor);
        return {
          code: "200",
          success: true,
          message: `Hotel created with ${input.floor} floor(s), ${input.roomPerFloor} room(s) per floor.`,
        };
      } catch (error) {
        if (error instanceof ApplicationError) {
          return {
            code: error.code ?? "500",
            success: false,
            message: error.message,
          };
        }
        throw error;
      }
    },
    bookRoom: async (root, { input }, context, info) => {
      try {
        const keycard = await context.services.book(
          input.roomNumber,
          input.guest
        );
        return {
          code: "200",
          success: true,
          message: `Room ${input.roomNumber} is booked by ${input.guest.name} with keycard number ${keycard}.`,
          keycard,
        };
      } catch (error) {
        if (error instanceof ApplicationError) {
          return {
            code: error.code ?? "500",
            success: false,
            message: error.message,
          };
        }
        throw error;
      }
    },
    bookRoomsByFloor: async (
      root,
      { input },
      context,
      info
    ) => {
      try {
        const bookedRooms = await context.services.bookByFloor(
          input.floor,
          input.guest
        );
        const rooms = bookedRooms
          .map((room: Room) => room.roomNumber)
          .join(", ");
        const keycardNumbers = bookedRooms
          .map((room: Room) => room.keycardNumber)
          .join(", ");
        return {
          code: "200",
          success: true,
          message: `Room ${rooms} are booked with keycard number ${keycardNumbers}`,
          bookedRooms: bookedRooms,
          keycards: keycardNumbers,
        };
      } catch (error) {
        if (error instanceof ApplicationError) {
          return {
            code: error.code ?? "500",
            success: false,
            message: error.message,
          };
        }
        throw error;
      }
    },
    checkoutRoom: async (
      root,
      { input },
      context,
      info
    ) => {
      try {
        const updatedRoom = await context.services.checkout(
          input.keycard,
          input.guestName
        );
        return {
          code: "200",
          success: true,
          message: `Room ${updatedRoom.roomNumber} is checkout.`,
        };
      } catch (error) {
        if (error instanceof ApplicationError) {
          return {
            code: error.code ?? "500",
            success: false,
            message: error.message,
          };
        }
        throw error;
      }
    },
    checkoutRoomsByFloor: async (
      root,
      { input },
      context,
      info
    ) => {
      try {
        const updatedRoom = await context.services.checkoutGuestByFloor(
          input.floor
        );
        const roomNumbersOnFloor = updatedRoom
          .map((room: Room) => room.roomNumber)
          .join(", ");
        return {
          code: "200",
          success: true,
          message: `Room ${roomNumbersOnFloor} is checkout.`,
        };
      } catch (error) {
        if (error instanceof ApplicationError) {
          return {
            code: error.code ?? "500",
            success: false,
            message: error.message,
          };
        }
        throw error;
      }
    },
  },
};


export default resolvers;