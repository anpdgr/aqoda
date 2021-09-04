const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const createRepositories = require("./prisma-repositories");
const createService = require("./services");
const { Guest } = require("./model");

const app = express();
const repositories = createRepositories();
const services = createService(repositories);
app.use(express.json());

app.get("/", (req, res, next) => {
  res.json({ message: "OK" });
});

//create_hotel
app.post("/create_hotel", async (req, res, next) => {
  try {
    const hotel = await services.createHotel(
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
});

//book
app.post("/book", async (req, res, next) => {
  try {
    const keycardNumber = await services.book(
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
});

//book_by_floor
app.post("/book_by_floor", async (req, res, next) => {
  try {
    const roomsOnFloor = await services.bookByFloor(
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
});

//checkout
app.post("/checkout", async (req, res, next) => {
  try {
    const updatedRoom = await services.checkout(
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
});

//checkout_guest_by_floor
app.post("/checkout_guest_by_floor", async (req, res, next) => {
  try {
    const roomsOnFloor = await services.checkoutGuestByFloor(req.body.floor);
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
});

//list_available_rooms
app.get("/list_available_rooms", async (req, res, next) => {
  try {
    const availableRooms = await services.listAvailableRooms();
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
});

//list_guest
app.get("/list_guests", async (req, res, next) => {
  try {
    const guests = await services.listGuests();
    const guestNames = guests.map((guest) => guest.name).join(", ");
    res.json({
      message: guestNames,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
});

//list_guests_by_age
app.get("/list_guests_by_age", async (req, res, next) => {
  try {
    const guestsByAge = (await services.listGuestsNameByAge(req.body.operation, req.body.age)).join(", ");
    res.json({
      message: guestsByAge,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
});

//list_guests_by_floor
app.get("/list_guests_by_floor", async (req, res, next) => {
  try {
    const guestsByFloor = (await services.listGuestsNameByFloor(req.body.floor)).join(", ");
    res.json({
      message: guestsByFloor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
});

//get_guest_in_room
app.get("/rooms/:id/guest", (req, res, next) => {
  console.log(req.params);
  res.json({ message: "OK" });
});

app.get("/get_guest_in_room", async (req, res, next) => {
  try {
    const guestInRoom = (await services.getRoomByRoomNumber(req.query.room.toString())).guest.name
    res.json({ message: guestInRoom });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
});

app.listen(3333, () => console.log("Server started"));
