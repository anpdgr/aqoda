const fs = require("fs");
const services = require("./services.js");
const repositories = require("./repositories.js");
const {
  HotelIsFullError,
  RoomIsAlreadyBookedError,
  RoomFloorIsAlreadyBookedError,
  GuestNotMatchKeycardNumberError,
  CheckoutAvailableRoomError,
  CheckoutAvailableRoomFloorError,
} = require("./error");
const { Guest } = require("./model");

class Command {
  constructor(name, params) {
    this.name = name;
    this.params = params;
  }
}

function main() {
  const fileName = "input.txt";
  const commands = getCommandsFromFileName(fileName);

  commands.forEach((command) => {
    switch (command.name) {
      case "create_hotel": {
        createHotel(command);

        break;
      }

      case "book": {
        book(command);

        break;
      }

      case "book_by_floor": {
        bookByFloor(command);

        break;
      }

      case "checkout": {
        checkout(command);

        break;
      }

      case "checkout_guest_by_floor": {
        checkoutGuestByFloor(command);

        break;
      }

      case "list_available_rooms": {
        listAvailableRooms(command);

        break;
      }

      case "list_guest": {
        listGuests(command);

        break;
      }

      case "list_guest_by_age": {
        listGuestsByAge(command);

        break;
      }

      case "list_guest_by_floor": {
        listGuestsByFloor(command);
        break;
      }

      case "get_guest_in_room": {
        getGuestsInRoom(command);
        break;
      }

      default: {
        console.log("Invalid Command");
        break;
      }
    }
  });
}

function getCommandsFromFileName(fileName) {
  const file = fs.readFileSync(fileName, "utf-8");
  return file
    .split("\n")
    .map((line) => line.split(" "))
    .map(
      ([commandName, ...params]) =>
        new Command(
          commandName.trim(),
          params.map((param) => {
            param = param.trim();
            const parsedParam = parseInt(param, 10);
            return Number.isNaN(parsedParam) ? param : parsedParam;
          })
        )
    );
}

function createHotel(command) {
  const [floor, roomPerFloor] = command.params;

  const hotel = services.createHotel(floor, roomPerFloor);

  console.log(
    `Hotel created with ${hotel.floor} floor(s), ${hotel.roomPerFloor} room(s) per floor.`
  );
}

function book(command) {
  const [roomNumber, name, age] = command.params;

  //book 203 Thor 32
  try {
    const guest = new Guest(name, age);
    const keycardNumber = services.book(roomNumber.toString(), guest);

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

function bookByFloor(command) {
  //book_by_floor 1 TonyStark 48
  const [floor, guest, age] = command.params;

  try {
    const roomsOnFloor = services.bookByFloor(floor, guest, age);
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
        console.log(`Cannot book floor ${floor} for ${guest}.`);
        break;
      }
      default:
        throw err;
    }
  }
}

function checkout(command) {
  //checkout 4 TonyStark
  const [keycardNumber, name] = command.params;

  try {
    const room = repositories.checkout(keycardNumber, name);
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

function checkoutGuestByFloor(command) {
  //checkout_guest_by_floor 1
  const [floor] = command.params;

  try {
    const roomsOnFloor = services.checkoutGuestByFloor(floor);
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

function listAvailableRooms(command) {
  console.log(
    services
      .listAvailableRooms()
      .map((availableRoom) => availableRoom.roomNumber)
      .join(", ")
  );
}

function listGuests(command) {
  //list_guest
  const allGuests = services.listGuests().map((guest) => guest.name);

  console.log(allGuests.join(", "));
}

function listGuestsByAge(command) {
  //list_guest_by_age < 18
  const [operation, age] = command.params;

  const guestsByAge = services
    .listGuestsNameByAge(operation, age);

  console.log(guestsByAge.join(", "));
}

function listGuestsByFloor(command) {
  //list_guest_by_floor 2
  const [floor] = command.params;

  const guestsByFloor = services.listGuestsNameByFloor(floor);

  console.log(guestsByFloor.join(", "));
}

function getGuestsInRoom(command) {
  //get_guest_in_room 203
  const [roomNumber] = command.params;

  console.log(services.getRoomByRoomNumber(roomNumber.toString()).guest.name);
}

main();
