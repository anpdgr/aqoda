import express, { ErrorRequestHandler } from "express";
import dotenv from "dotenv";
dotenv.config();
import createPrismaClient from "./postgres-client";
import createRepositories from "./postgres-repositories";
import createService from "./services";
import { controller } from "./controller";
import { ApplicationError } from "./error";

const app = express();

const client = createPrismaClient()
const repositories = createRepositories(client);
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

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  switch (true) {
    case error instanceof ApplicationError: {
      res.status(400).json({ errorMessage: error.message });
      break;
    }
    default: {
      res.status(500).json({ errorMessage: error.message });
      console.error(error);
    }
  }
  // res.status(400).json({ error: error.message });
}

app.use(errorHandler);

app.listen(process.env.PORT, () => console.log("Server started"));
