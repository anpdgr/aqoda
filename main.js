const fs = require("fs");

class HotelIsFullError extends Error {}
class RoomIsAlreadyBookedError extends Error {
  constructor(guest, age, roomNumber, keycardNumber) {
    super();
    this.guest = guest;
    this.age = age;
    this.roomNumber = roomNumber;
    this.keycardNumber = keycardNumber;
  }
}
class RoomFloorIsAlreadyBookedError extends Error {
  constructor(floor, guest) {
    super();
    this.floor = floor;
    this.guest = guest;
  }
}
class GuestNotMatchKeycardNumberError extends Error {}
class CheckoutAvailableRoomError extends Error {}
class CheckoutAvailableRoomFloorError extends Error {}

class Command {
  constructor(name, params) {
    this.name = name;
    this.params = params;
  }
}

class Room {
  constructor(roomNumber, floor, keycardNumber, guest, age) {
    this.roomNumber = roomNumber;
    this.floor = floor;
    this.keycardNumber = keycardNumber;
    this.guest = guest;
    this.age = age;
  }
}

const bookedRooms = [];
let availableRooms = [];
const allRooms = [];
const keycards = [];
let bookedRoomNumbers = [];

function main() {
  const fileName = "input.txt";
  const commands = getCommandsFromFileName(fileName);

  commands.forEach((command) => {
    //find available room
    bookedRoomNumbers = [];
    bookedRooms.forEach((room) => {
      bookedRoomNumbers.push(room.roomNumber);
    });
    availableRooms = allRooms.filter(
      (room) => !bookedRoomNumbers.includes(room)
    );

    switch (command.name) {
      case "create_hotel": {
        const [floor, roomPerFloor] = command.params;

        const hotel = createHotel(floor, roomPerFloor);

        console.log(
          `Hotel created with ${hotel.floor} floor(s), ${hotel.roomPerFloor} room(s) per floor.`
        );
        break;
      }

      case "book": {
        const [roomNumber, guest, age] = command.params;

        //book 203 Thor 32
        try {
          const keycardNumber = book(roomNumber, guest, age);

          console.log(
            `Room ${roomNumber} is booked by ${guest} with keycard number ${keycardNumber}.`
          );
        } catch (err) {
          switch (true) {
            case err instanceof HotelIsFullError: {
              console.log("Hotel is fully booked.");
              break;
            }
            case err instanceof RoomIsAlreadyBookedError: {
              console.log(
                `Cannot book room ${err.roomNumber} for ${guest}, The room is currently booked by ${err.guest}.`
              );
              break;
            }
            default:
              throw err;
          }
        }

        break;
      }

      case "book_by_floor": {
        //book_by_floor 1 TonyStark 48
        const [floor, guest, age] = command.params;

        try {
          const list = bookByFloor(floor, guest, age);
          // [{keycardNumber, roomNumber}, {keycardNumber, roomNumber}]
          const rooms = list.map((item) => item.roomNumber);
          const keycardNumbers = list.map((item) => item.keycardNumber);
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

        break;
      }

      case "checkout": {
        //checkout 4 TonyStark
        const [keycardNumber, guest] = command.params;

        try {
          checkout(keycardNumber, guest);
        } catch (err) {
          switch (true) {
            case err instanceof GuestNotMatchKeycardNumberError: {
              console.log(
                `Only ${guest} can checkout with keycard number ${keycardNumber}.`
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

        break;
      }

      case "checkout_guest_by_floor": {
        //checkout_guest_by_floor 1
        const [floor] = command.params;

        try {
          checkoutGuestByFloor(floor);
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

        break;
      }

      case "list_available_rooms": {
        console.log(availableRooms.join(", "));
        break;
      }

      case "list_guest": {
        //list_guest
        const allGuests = getAllGuests();

        console.log(allGuests.join(", "));
        break;
      }

      case "list_guest_by_age": {
        //list_guest_by_age < 18
        const [operation, age] = command.params;

        const guestsByAge = getGuestsByAge(operation, age);

        console.log(guestsByAge.join(", "));

        break;
      }

      case "list_guest_by_floor": {
        //list_guest_by_floor 2
        const [floor] = command.params;

        const guestsByFloor = listGuestsByFloor(floor);

        console.log(guestsByFloor.join(", "));
        break;
      }

      case "get_guest_in_room": {
        //get_guest_in_room 203
        const [room] = command.params;

        console.log(findRoomByRoomNumber(room).guest);
        break;
      }

      default: {
        console.log("Invalid Command");
        break;
      }
    }
  });
}

function createKeycards(floor, roomPerFloor) {
  //set all possible keycard number DESC
  const numberOfKeycard = floor * roomPerFloor;

  for (let count = numberOfKeycard; count >= 1; count--) {
    keycards.push(count);
  }
}

function createRooms(floor, roomPerFloor) {
  //set all room num
  for (let floorCount = 1; floorCount <= floor; floorCount++) {
    for (let roomCount = 1; roomCount <= roomPerFloor; roomCount++) {
      if (roomCount.toString()[1] === undefined) {
        //f01-f09
        roomNumber = floorCount.toString() + "0" + roomCount.toString();
      } else {
        //f10-f99
        roomNumber = floorCount.toString() + roomCount.toString();
      }

      allRooms.push(Number(roomNumber));
    }
  }
}

function createHotel(floor, roomPerFloor) {
  const hotel = { floor, roomPerFloor };

  if (roomPerFloor > 99)
    throw new Error("Can not create hotel with 100 or more rooms per floor");

  createKeycards(floor, roomPerFloor);
  createRooms(floor, roomPerFloor);

  return hotel;
}

function isHotelFullyBooked() {
  return bookedRoomNumbers.length === allRooms.length;
}

function isRoomAvailable(room) {
  return room === 0;
}

function generateKeycard() {
  return keycards.pop();
}

function bookRoom(roomNumber, keycardNumber, guest, age) {
  bookedRooms.push(
    new Room(
      roomNumber,
      Number(roomNumber.toString()[0]),
      keycardNumber,
      guest,
      age
    )
  );
}

function book(roomNumber, guest, age) {
  if (isHotelFullyBooked()) {
    throw new HotelIsFullError();
  }

  const room = findRoomByRoomNumber(roomNumber);
  if (!isRoomAvailable(room)) {
    throw new RoomIsAlreadyBookedError(
      room.guest,
      room.age,
      roomNumber,
      room.keycardNumber
    );
  }

  //room is available -> book
  //book
  const keycardNumber = generateKeycard();
  bookRoom(roomNumber, keycardNumber, guest, age);
  return keycardNumber;
}

function findRoomNumbersByFloor(floor) {
  return availableRooms.filter(
    (roomNumber) => roomNumber.toString()[0] == floor
  );
}

function bookByFloor(floor, guest, age) {
  if (isRoomBookedByFloor(floor)) {
    throw new RoomFloorIsAlreadyBookedError(floor, guest);
  }
  const roomNumbers = findRoomNumbersByFloor(floor);
  return roomNumbers.map((roomNumber) => {
    const keycardNumber = book(roomNumber, guest, age);
    return { keycardNumber, roomNumber };
  });
}

function hasRoomBookedWithThisKeycardNumber(room) {
  return room != 0;
}

function isGuestMatchKeycardNumber(room, guest) {
  return room.guest === guest;
}

function checkoutRoom(room) {
  //delete that room by index
  bookedRooms.splice(bookedRooms.indexOf(room), 1);
  //push keycard back
  keycards.push(room.keycardNumber);
}

function checkout(keycardNumber, guest) {
  room = findRoomByKeycardNumber(keycardNumber);

  if (!hasRoomBookedWithThisKeycardNumber()) {
    throw new CheckoutAvailableRoomError();
  }
  //there is the room that booked with this keycard number
  if (!isGuestMatchKeycardNumber(room, guest)) {
    throw new GuestNotMatchKeycardNumberError();
  }
  //name match with keycardNumber
  //checkout
  checkoutRoom(room);

  console.log(`Room ${room.roomNumber} is checkout.`);
}

function getRoomsOnFloor(floor) {
  //create array of all booked roomNum on that floor
  return bookedRoomNumbers.filter(
    (roomNumber) => roomNumber.toString()[0] == floor
  );
}

function checkoutRoomByFloor(roomsOnFloor) {
  for (let roomCount = 0; roomCount < roomsOnFloor.length; roomCount++) {
    let room = findRoomByRoomNumber(roomsOnFloor[roomCount]);

    checkoutRoom(room);
  }
}
function checkoutGuestByFloor(floor) {
  if (!isRoomBookedByFloor(floor)) {
    throw new CheckoutAvailableRoomFloorError();
  }
  //there is some room on that floor was booked
  //checkout that room
  const roomsOnFloor = getRoomsOnFloor(floor);

  checkoutRoomByFloor(roomsOnFloor);

  console.log(`Room ${roomsOnFloor.join(", ")} are checkout.`);
}

function getAllGuests() {
  const allGuests = [];

  bookedRooms.forEach((room) => {
    if (!allGuests.find((guest) => guest === room.guest))
      allGuests.push(room.guest);
  });

  return allGuests;
}

function isGuestPushed(guestsArray, room) {
  guestsArray.find((guest) => guest === room.guest);
}

function getGuestsByAge(operation, age) {
  const guestsByAge = [];

  bookedRooms.forEach((room) => {
    if (eval(room.age + operation + age)) {
      if (!isGuestPushed(guestsByAge, room)) guestsByAge.push(room.guest);
    }
  });

  return guestsByAge;
}

function isRoomOnFloor(room, floor) {
  return room.floor === floor;
}

function listGuestsByFloor(floor) {
  const guestsByFloor = [];

  bookedRooms.forEach((room) => {
    if (isRoomOnFloor(room, floor))
      if (!isGuestPushed(guestsByFloor, room)) guestsByFloor.push(room.guest);
  });

  return guestsByFloor;
}

function isRoomBookedByFloor(floor) {
  result = false;

  bookedRooms.forEach((room) => (room.floor === floor ? (result = true) : ""));

  return result;
}

function findRoomByKeycardNumber(keycardNumber) {
  filteredRoom = 0;

  bookedRooms.forEach((room) => {
    if (room.keycardNumber === keycardNumber) filteredRoom = room;
  });

  return filteredRoom;
}

function findRoomByRoomNumber(roomNumber) {
  filteredRoom = 0;

  bookedRooms.forEach((room) => {
    if (room.roomNumber === roomNumber) filteredRoom = room;
  });

  return filteredRoom;
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

main();
