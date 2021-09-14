import { Guest, Room } from "./model";
import {
  HotelIsFullError,
  RoomIsAlreadyBookedError,
  RoomFloorIsAlreadyBookedError,
  GuestNotMatchKeycardNumberError,
  CheckoutAvailableRoomError,
  CheckoutAvailableRoomFloorError,
} from "./error";
import servicesModule from "./services"

class Command {
  constructor(public name: string, public params: any) {}
}

export default function createApplication(services: ReturnType<typeof servicesModule>) {
  
  async function createHotel(command: Command) {
    let [floor, roomPerFloor] = command.params;

    const hotel = await services.createHotel(Number.parseInt(floor), Number.parseInt(roomPerFloor));

    console.log(
      `Hotel created with ${hotel.floor} floor(s), ${hotel.roomPerFloor} room(s) per floor.`
    );
  }

  async function book(command: Command) {
    const [roomNumber, name, age] = command.params;

    //book 203 Thor 32
    try {
      const guest = new Guest(name, Number.parseInt(age));
      const keycardNumber = await services.book(roomNumber.toString(), guest);

      console.log(
        `Room ${roomNumber} is booked by ${name} with keycard number ${keycardNumber}.`
      );
    } catch (err: any) {
      switch (true) {
        case err instanceof HotelIsFullError: {
          console.log("Hotel is fully booked.");
          break;
        }
        case err instanceof RoomIsAlreadyBookedError: {
          console.log(
            `Cannot book room ${err.room.roomNumber} for ${name}, The room is currently booked by ${err.room.guest.name}.`
          );
          break;
        }
        default:
          throw err;
      }
    }
  }

  async function bookByFloor(command: Command) {
    //book_by_floor 1 TonyStark 48
    const [floor, name, age] = command.params;

    try {
      const guest = new Guest(name, Number.parseInt(age));
      const roomsOnFloor = await services.bookByFloor(Number.parseInt(floor), guest);
      // [{keycardNumber, roomNumber}, {keycardNumber, roomNumber}]
      const rooms = roomsOnFloor.map((room: Room) => room.roomNumber);
      const keycardNumbers = roomsOnFloor.map((room: Room) => room.keycardNumber);
      console.log(
        `Room ${rooms.join(
          ", "
        )} are booked with keycard number ${keycardNumbers.join(", ")}`
      );
    } catch (err) {
      switch (true) {
        case err instanceof RoomFloorIsAlreadyBookedError: {
          console.log(`Cannot book floor ${floor} for ${name}.`);
          break;
        }
        default:
          throw err;
      }
    }
  }

  async function checkout(command: Command) {
    //checkout 4 TonyStark
    const [keycardNumber, name] = command.params;

    try {
      const room = await services.checkout(Number.parseInt(keycardNumber), name);
      console.log(`Room ${room.roomNumber} is checkout.`);
    } catch (err: any) {
      switch (true) {
        case err instanceof GuestNotMatchKeycardNumberError: {
          console.log(
            `Only ${err.room.guest.name} can checkout with keycard number ${keycardNumber}.`
          );
          break;
        }
        case err instanceof CheckoutAvailableRoomError: {
          console.log("You can not checkout available room");
          break;
        }
        default:
          throw err;
      }
    }
  }

  async function checkoutGuestByFloor(command: Command) {
    //checkout_guest_by_floor 1
    const [floor] = command.params;

    try {
      const roomsOnFloor = await services.checkoutGuestByFloor(Number.parseInt(floor));
      console.log(
        `Room ${roomsOnFloor
          .map((room: Room) => room.roomNumber)
          .join(", ")} are checkout.`
      );
    } catch (err) {
      switch (true) {
        case err instanceof CheckoutAvailableRoomFloorError: {
          console.log(`No room on floor ${floor} was booked.`);
          break;
        }
        default:
          throw err;
      }
    }
  }

  async function listAvailableRooms(command: Command) {
    console.log(
      (await services.listAvailableRooms())
        .map((availableRoom: Room) => availableRoom.roomNumber)
        .join(", ")
    );
  }

  async function listGuests(command: Command) {
    //list_guest
    const allGuests = (await services.listGuests()).map((guest) => guest!.name);

    console.log(allGuests.join(", "));
  }

  async function listGuestsByAge(command: Command) {
    //list_guest_by_age < 18
    const [operation, age] = command.params;

    const guestsByAge = await services.listGuestsNameByAge(operation, Number.parseInt(age));

    console.log(guestsByAge.join(", "));
  }

  async function listGuestsByFloor(command: Command) {
    //list_guest_by_floor 2
    const [floor] = command.params;

    const guestsByFloor = await services.listGuestsNameByFloor(Number.parseInt(floor));

    console.log(guestsByFloor.join(", "));
  }

  async function getGuestsInRoom(command: Command) {
    //get_guest_in_room 203
    const [roomNumber] = command.params;

    console.log(
      (await services.getRoomByRoomNumber(roomNumber.toString()))!.guest!.name
    );
  }

  return {
    createHotel,
    book,
    bookByFloor,
    checkout,
    checkoutGuestByFloor,
    listAvailableRooms,
    listGuests,
    listGuestsByAge,
    listGuestsByFloor,
    getGuestsInRoom,
  };
}

// module.exports = createApplication;