const {
  HotelIsFullError,
  RoomIsAlreadyBookedError,
  RoomFloorIsAlreadyBookedError,
  CheckoutAvailableRoomFloorError,
  GuestNotMatchKeycardNumberError,
  CheckoutAvailableRoomError,
} = require("./error");


function createService(repository) {
  const {
    createKeycards,
    generateKeycard,
    getRoomByRoomNumber,
    listAvailableRooms,
    createRooms,
    listBookedRoom,
    getRoomByKeycardNumber,
    returnKeycard,
    listRooms,
    saveRoom
  } = repository;

  async function isHotelFullyBooked() {
    return (await listBookedRoom()).length === (await listRooms()).length;
  }
  
  async function hasBookedRoomOnFloor(floor) {
    return (await listBookedRoomsByFloor(floor)).length > 0;
  }
  
  async function listBookedRoomsByFloor(floor) {
    return (await listBookedRoom()).filter((room) => room.floor === floor);
  }
  
  async function checkoutRoomByFloor(roomsOnFloor) {
    await roomsOnFloor.reduce(async (initial, room) => {
      await initial;
      await checkout(
        room.keycardNumber,
        room.guest.name
      )
  
      return Promise.resolve()
    }, Promise.resolve())
  
  }
  
  async function listRoomsByFloor(floor) {
    return (await listAvailableRooms()).filter((room) => room.floor === floor);
  }
  
  async function createHotel(floor, roomPerFloor) {
    const hotel = { floor, roomPerFloor };
  
    if (roomPerFloor > 99)
      throw new Error("Can not create hotel with 100 or more rooms per floor");
  
    // await firestoreRepo.createKeycards(floor, roomPerFloor);
    await createKeycards(floor, roomPerFloor);
    await createRooms(floor, roomPerFloor);
  
    return hotel;
  }
  
  async function book(roomNumber, guest) {
    if (await isHotelFullyBooked()) {
      throw new HotelIsFullError();
    }
  
    const room = await getRoomByRoomNumber(roomNumber);
    if (!room.isAvailable) {
      throw new RoomIsAlreadyBookedError(room);
    }
  
    const keycardNumber = await generateKeycard();
    const updatedBook = room.book(guest, keycardNumber);
    await saveRoom(updatedBook)
    return keycardNumber;
  }
  
  async function bookByFloor(floor, guest) {
    if (await hasBookedRoomOnFloor(floor)) {
      throw new RoomFloorIsAlreadyBookedError(floor, guest.name);
    }
    const roomsOnFloor = await listRoomsByFloor(floor);
  
    await roomsOnFloor.reduce(async (initial, room) => {
      await initial;
      await book(room.roomNumber, guest)
  
      return Promise.resolve()
    }, Promise.resolve())
  
    return listBookedRoomsByFloor(floor)
  }
  
  async function checkout(keycardNumber, name) {
    const room = await getRoomByKeycardNumber(keycardNumber);
    if (!room) {
      throw new CheckoutAvailableRoomError();
    }
    //there is the room that booked with this keycard number
    if (room.guest.name != name) {
      throw new GuestNotMatchKeycardNumberError(room);
    }
    //name match with keycardNumber
    //checkout
    await returnKeycard(room);
    const updatedRoom = room.checkout();
    await saveRoom(updatedRoom);
    return updatedRoom;
  }
  
  async function checkoutGuestByFloor(floor) {
    if (!await hasBookedRoomOnFloor(floor)) {
      throw new CheckoutAvailableRoomFloorError();
    }
    //there is some room on that floor was booked
    //checkout that room
    const roomsOnFloor = await listBookedRoomsByFloor(floor);
  
    await checkoutRoomByFloor(roomsOnFloor);
    return roomsOnFloor;
  }
  
  async function listGuests() {
    return result = (await listBookedRoom()).map((room) => room.guest);
  }
  
  async function listGuestsNameByFloor(floor) {
    return Array.from(
      new Set((await listBookedRoomsByFloor(floor)).map((room) => room.guest.name))
    );
  }
  
  async function listGuestsNameByAge(operation, age) {
    return Array.from(
      new Set(
        (await listGuests())
          .filter((guest) => eval(guest.age + operation + age))
          .map((guest) => guest.name)
      )
    );
  }

  return {
    createHotel,
    book,
    getRoomByRoomNumber,
    bookByFloor,
    checkoutGuestByFloor,
    listAvailableRooms,
    checkout,
    listGuests,
    listGuestsNameByFloor,
    listGuestsNameByAge,
  };
}

module.exports = createService;