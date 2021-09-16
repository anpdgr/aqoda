import {
  HotelIsFullError,
  RoomIsAlreadyBookedError,
  RoomFloorIsAlreadyBookedError,
  CheckoutAvailableRoomFloorError,
  GuestNotMatchKeycardNumberError,
  CheckoutAvailableRoomError,
} from "./error";
import { Guest, Room } from "./model";
import { Repository } from "./repositories";

function createService(repository: Repository) {

  async function isHotelFullyBooked(): Promise<boolean> {
    return (await repository.listBookedRoom()).length === (await repository.listRooms()).length;
  }

  async function hasBookedRoomOnFloor(floor: number): Promise<boolean> {
    return (await listBookedRoomsByFloor(floor)).length > 0;
  }

  async function listBookedRoomsByFloor(floor: number) {
    return (await repository.listBookedRoom()).filter((room: Room) => room.floor === floor);
  }

  async function checkoutRoomByFloor(roomsOnFloor: Room[]): Promise<void> {
    await roomsOnFloor.reduce(async (initial, room: Room) => {
      await initial;
      await checkout(room.keycardNumber!, room.guest!.name);

      return Promise.resolve();
    }, Promise.resolve());
  }

  async function listRoomsByFloor(floor: number): Promise<Room[]> {
    return (await repository.listAvailableRooms()).filter((room: Room) => room.floor === floor);
  }

  async function createHotel(floor: number, roomPerFloor: number): Promise<{ floor: number, roomPerFloor: number }> {
    const hotel = { floor, roomPerFloor };

    if (roomPerFloor > 99)
      throw new Error("Can not create hotel with 100 or more rooms per floor");

    // await firestoreRepo.createKeycards(floor, roomPerFloor);
    await repository.createKeycards(floor, roomPerFloor);
    await repository.createRooms(floor, roomPerFloor);

    return hotel;
  }

  async function book(roomNumber: string, guest: Guest): Promise<number> {
    if (await isHotelFullyBooked()) {
      throw new HotelIsFullError();
    }

    const room = await repository.getRoomByRoomNumber(roomNumber);
    if (!room!.isAvailable) {
      throw new RoomIsAlreadyBookedError(room!, guest);
    }

    const keycardNumber: number = await repository.generateKeycard();
    const updatedBook: Room = room!.book(guest, keycardNumber);
    await repository.saveRoom(updatedBook);
    return keycardNumber;
  }

  async function bookByFloor(floor: number, guest: Guest): Promise<Room[]> {
    if (await hasBookedRoomOnFloor(floor)) {
      throw new RoomFloorIsAlreadyBookedError(floor, guest);
    }
    const roomsOnFloor = await listRoomsByFloor(floor);
    await roomsOnFloor.reduce(async (initial, room: Room) => {
      await initial;
      await book(room.roomNumber, guest);

      return Promise.resolve();
    }, Promise.resolve());

    return await listBookedRoomsByFloor(floor);
  }

  async function checkout(keycardNumber: number, name: string): Promise<Room> {
    const room = await repository.getRoomByKeycardNumber(keycardNumber);
    if (!room) {
      throw new CheckoutAvailableRoomError();
    }
    //there is the room that booked with this keycard number
    if (room.guest!.name != name) {
      throw new GuestNotMatchKeycardNumberError(room, keycardNumber);
    }
    //name match with keycardNumber
    //checkout
    await repository.returnKeycard(room);
    const updatedRoom: Room = room.checkout();
    await repository.saveRoom(updatedRoom);
    return updatedRoom;
  }

  async function checkoutGuestByFloor(floor: number): Promise<Room[]> {
    if (!(await hasBookedRoomOnFloor(floor))) {
      throw new CheckoutAvailableRoomFloorError(floor);
    }
    //there is some room on that floor was booked
    //checkout that room
    const roomsOnFloor: Room[] = await listBookedRoomsByFloor(floor);

    await checkoutRoomByFloor(roomsOnFloor);
    return roomsOnFloor;
  }

  async function listGuests() {
    return (await repository.listBookedRoom()).map((room) => room.guest!)
  }

  async function listGuestsNameByFloor(floor: number) {
    return Array.from(
      new Set(
        (await listBookedRoomsByFloor(floor)).map((room) => room.guest!.name)
      )
    );
  }

  async function listGuestsNameByAge(operation: string, age: number) {
    return Array.from(
      new Set(
        (await listGuests())
          .filter((guest) => eval(guest!.age + operation + age))
          .map((guest) => guest!.name)
      )
    );
  }

  async function listAvailableRooms() {
    return repository.listAvailableRooms();
  }

  async function getRoomByRoomNumber(roomNumber: string) {
    return repository.getRoomByRoomNumber(roomNumber);
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

export default createService;

export type Services = ReturnType<typeof createService>
