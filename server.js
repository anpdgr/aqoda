//DONE: controller -> controller.js, req.services

const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const createRepositories = require("./prisma-repositories");
const createService = require("./services");
const controller = require("./controller");

const app = express();
const repositories = createRepositories();
const services = createService(repositories);

app.use(express.json());

app.use((req, res, next) => {
  req.services = services;
  next();
});

app.get("/", (req, res, next) => {
  res.json({ message: "OK" });
});

//create_hotel
app.post("/create_hotel", controller.createHotel);

//book
app.post("/book", controller.book);

//book_by_floor
app.post("/book_by_floor", controller.bookByFloor);

//checkout
app.post("/checkout", controller.checkout);

//checkout_guest_by_floor
app.post("/checkout_guest_by_floor", controller.checkoutGuestByFloor);

//list_available_rooms
app.get("/list_available_rooms", controller.listAvailableRooms);

//list_guest
app.get("/list_guests", controller.listGuests);

//list_guests_by_age
app.get("/list_guests_by_age", controller.listGuestsNameByAge);

//list_guests_by_floor
app.get("/list_guests_by_floor", controller.listGuestsNameByFloor);

//get_guest_in_room
app.get("/get_guest_in_room", controller.getGuestsInRoom);

app.listen(3333, () => console.log("Server started"));
