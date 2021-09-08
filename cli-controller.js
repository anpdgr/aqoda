const {
  HotelIsFullError,
  RoomIsAlreadyBookedError,
  RoomFloorIsAlreadyBookedError,
  GuestNotMatchKeycardNumberError,
  CheckoutAvailableRoomError,
  CheckoutAvailableRoomFloorError,
} = require("./src/error");
const { Guest } = require("./model");

function createApplication(services) {
  
  async function createHotel(command) {
    const [floor, roomPerFloor] = command.params;

    const hotel = await services.createHotel(floor, roomPerFloor);

    console.log(
      `Hotel created with ${hotel.floor} floor(s), ${hotel.roomPerFloor} room(s) per floor.`
    );
  }

  async function book(command) {
    const [roomNumber, name, age] = command.params;

    //book 203 Thor 32
    try {
      const guest = new Guest(name, age);
      const keycardNumber = await services.book(roomNumber.toString(), guest);

      console.log(
        `Room ${roomNumber} is booked by ${name} with keycard number ${keycardNumber}.`
      );
    } catch (err) {
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

  async function bookByFloor(command) {
    //book_by_floor 1 TonyStark 48
    const [floor, name, age] = command.params;

    try {
      const guest = new Guest(name, age);
      const roomsOnFloor = await services.bookByFloor(floor, guest);
      // [{keycardNumber, roomNumber}, {keycardNumber, roomNumber}]
      const rooms = roomsOnFloor.map((room) => room.roomNumber);
      const keycardNumbers = roomsOnFloor.map((room) => room.keycardNumber);
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

  async function checkout(command) {
    //checkout 4 TonyStark
    const [keycardNumber, name] = command.params;

    try {
      const room = await services.checkout(keycardNumber, name);
      console.log(`Room ${room.roomNumber} is checkout.`);
    } catch (err) {
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

  async function checkoutGuestByFloor(command) {
    //checkout_guest_by_floor 1
    const [floor] = command.params;

    try {
      const roomsOnFloor = await services.checkoutGuestByFloor(floor);
      console.log(
        `Room ${roomsOnFloor
          .map((room) => room.roomNumber)
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

  async function listAvailableRooms(command) {
    console.log(
      (await services.listAvailableRooms())
        .map((availableRoom) => availableRoom.roomNumber)
        .join(", ")
    );
  }

  async function listGuests(command) {
    //list_guest
    const allGuests = (await services.listGuests()).map((guest) => guest.name);

    console.log(allGuests.join(", "));
  }

  async function listGuestsByAge(command) {
    //list_guest_by_age < 18
    const [operation, age] = command.params;

    const guestsByAge = await services.listGuestsNameByAge(operation, age);

    console.log(guestsByAge.join(", "));
  }

  async function listGuestsByFloor(command) {
    //list_guest_by_floor 2
    const [floor] = command.params;

    const guestsByFloor = await services.listGuestsNameByFloor(floor);

    console.log(guestsByFloor.join(", "));
  }

  async function getGuestsInRoom(command) {
    //get_guest_in_room 203
    const [roomNumber] = command.params;

    console.log(
      (await services.getRoomByRoomNumber(roomNumber.toString())).guest.name
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

module.exports = createApplication;