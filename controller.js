//DONE: refactor controller -> using reqHandler
//DONE: show error, correct the status code

const { Guest } = require("./model");

//create_hotel
const createHotel = requestHandler(async (req) => {
  const hotel = await req.services.createHotel(
    req.body.floor,
    req.body.roomPerFloor
  );
  return {
    message: `Hotel created with ${hotel.floor} floor(s), ${hotel.roomPerFloor} room(s) per floor.`,
  };
});

//book
const book = requestHandler(async (req) => {
  const keycardNumber = await req.services.book(
    req.body.roomNumber,
    new Guest(req.body.guestName, req.body.guestAge)
  );
  return {
    message: `Room ${req.body.roomNumber} is booked by ${req.body.guestName} with keycard number ${keycardNumber}.`,
  };
});

//book_by_floor
const bookByFloor = requestHandler(async (req) => {
  const roomsOnFloor = await req.services.bookByFloor(
    req.body.floor,
    new Guest(req.body.guestName, req.body.guestAge)
  );
  const rooms = roomsOnFloor.map((room) => room.roomNumber);
  const keycardNumbers = roomsOnFloor.map((room) => room.keycardNumber);
  return {
    message: `Room ${rooms.join(
      ", "
    )} are booked with keycard number ${keycardNumbers.join(", ")}`,
  };
});

//checkout
const checkout = requestHandler(async (req) => {
  const updatedRoom = await req.services.checkout(
    req.body.keycardNumber,
    req.body.guestName
  );
  return {
    message: `Room ${updatedRoom.roomNumber} is checkout.`,
  };
});

//checkout_guest_by_floor
const checkoutGuestByFloor = requestHandler(async (req) => {
  const roomsOnFloor = await req.services.checkoutGuestByFloor(req.body.floor);
  const roomNumbersOnFloor = roomsOnFloor
    .map((room) => room.roomNumber)
    .join(", ");
  return { message: `Room ${roomNumbersOnFloor} is checkout.` };
});

//list_available_rooms
const listAvailableRooms = requestHandler(async (req) => {
  const availableRooms = await req.services.listAvailableRooms();
  const availableRoomNumbers = availableRooms
    .map((availableRoom) => availableRoom.roomNumber)
    .join(", ");
  return {
    message: availableRoomNumbers,
  };
});

//list_guest
const listGuests = requestHandler(async (req) => {
  const guests = await req.services.listGuests();
  const guestNames = guests.map((guest) => guest.name).join(", ");
  return { message: guestNames };
});

//list_guests_by_age
const listGuestsNameByAge = requestHandler(async (req) => {
  const guestsByAge = (
    await req.services.listGuestsNameByAge(req.body.operation, req.body.age)
  ).join(", ");
  return {
    message: guestsByAge,
  };
});

//list_guests_by_floor
const listGuestsNameByFloor = requestHandler(async (req) => {
  const guestsByFloor = (
    await req.services.listGuestsNameByFloor(req.body.floor)
  ).join(", ");
  return {
    message: guestsByFloor,
  };
});

//get_guest_in_room
const getGuestsInRoom = requestHandler(async (req) => {
  const guestInRoom = (
    await req.services.getRoomByRoomNumber(req.query.room.toString())
  ).guest.name;
  return { message: guestInRoom };
});

function requestHandler(handler) {
  return async (req, res, next) => {
    try {
      const result = await handler(req);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  createHotel,
  book,
  bookByFloor,
  checkout,
  checkoutGuestByFloor,
  listAvailableRooms,
  listGuests,
  listGuestsNameByAge,
  listGuestsNameByFloor,
  getGuestsInRoom,
};
