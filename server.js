const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const createRepositories = require("./firestore-repositories");
const createService = require("./services");

const app = express();
const repositories = createRepositories();
const service = createService(repositories);
app.use(express.json());

app.get("/", (req, res, next) => {
  res.json({ message: "OK" });
});

app.post(
  "/create_hotel",
  async (req, res, next) => {
    try {
      const hotel = await service.createHotel(req.body.floor, req.body.roomPerFloor);
      res.json({ message: `Hotel created with ${hotel.floor} floor(s), ${hotel.roomPerFloor} room(s) per floor.` });
    } catch(error) {
      res.status(500).json({error: error.message});
      console.error(error);
    }
  }
);

app.get('/rooms/:id/guest', (req, res, next) => {
  console.log(req.params);
  res.json({ message: "OK" });
})

app.get('/getguestinroom', (req, res, next) => {
  console.log(req.query);
  res.json({ message: "OK" });
})

app.listen(3333, () => console.log("Server started"));
