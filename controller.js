const { Guest } = require("./model");

//create_hotel
async function createHotel(req, res, next) {
  try {
    const hotel = await req.services.createHotel(
      req.body.floor,
      req.body.roomPerFloor
    );
    res.json({
      message: `Hotel created with ${hotel.floor} floor(s), ${hotel.roomPerFloor} room(s) per floor.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}

//book
async function book(req, res, next) {
  try {
    const keycardNumber = await req.services.book(
      req.body.roomNumber,
      new Guest(req.body.guestName, req.body.guestAge)
    );
    res.json({
      message: `Room ${req.body.roomNumber} is booked by ${req.body.guestName} with keycard number ${keycardNumber}.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}

//book_by_floor
async function bookByFloor(req, res, next) {
  try {
    const roomsOnFloor = await req.services.bookByFloor(
      req.body.floor,
      new Guest(req.body.guestName, req.body.guestAge)
    );
    const rooms = roomsOnFloor.map((room) => room.roomNumber);
    const keycardNumbers = roomsOnFloor.map((room) => room.keycardNumber);
    res.json({
      message: `Room ${rooms.join(
        ", "
      )} are booked with keycard number ${keycardNumbers.join(", ")}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}

//checkout
async function checkout(req, res, next) {
  try {
    const updatedRoom = await req.services.checkout(
      req.body.keycardNumber,
      req.body.guestName
    );
    res.json({
      message: `Room ${updatedRoom.roomNumber} is checkout.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}

//checkout_guest_by_floor
async function checkoutGuestByFloor(req, res, next) {
  try {
    const roomsOnFloor = await req.services.checkoutGuestByFloor(
      req.body.floor
    );
    const roomNumbersOnFloor = roomsOnFloor
      .map((room) => room.roomNumber)
      .join(", ");
    res.json({
      message: `Room ${roomNumbersOnFloor} is checkout.`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}

//list_available_rooms
async function listAvailableRooms(req, res, next) {
  try {
    const availableRooms = await req.services.listAvailableRooms();
    const availableRoomNumbers = availableRooms
      .map((availableRoom) => availableRoom.roomNumber)
      .join(", ");
    res.json({
      message: availableRoomNumbers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}

//list_guest
async function listGuests(req, res, next) {
  try {
    const guests = await req.services.listGuests();
    const guestNames = guests.map((guest) => guest.name).join(", ");
    res.json({
      message: guestNames,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}

//list_guests_by_age
async function listGuestsNameByAge(req, res, next) {
  try {
    const guestsByAge = (
      await req.services.listGuestsNameByAge(req.body.operation, req.body.age)
    ).join(", ");
    res.json({
      message: guestsByAge,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}

//list_guests_by_floor
async function listGuestsNameByFloor(req, res, next) {
  try {
    const guestsByFloor = (
      await req.services.listGuestsNameByFloor(req.body.floor)
    ).join(", ");
    res.json({
      message: guestsByFloor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}

//get_guest_in_room
async function getGuestsInRoom(req, res, next) {
  try {
    const guestInRoom = (
      await req.services.getRoomByRoomNumber(req.query.room.toString())
    ).guest.name;
    res.json({ message: guestInRoom });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
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
