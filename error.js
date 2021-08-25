exports.HotelIsFullError = class HotelIsFullError extends Error {}
exports.RoomFloorIsAlreadyBookedError = class RoomFloorIsAlreadyBookedError extends Error {
  constructor(floor, guest) {
    super();
    this.floor = floor;
    this.guest = guest;
  }
}
exports.GuestNotMatchKeycardNumberError = class GuestNotMatchKeycardNumberError extends Error {}
exports.CheckoutAvailableRoomError = class CheckoutAvailableRoomError extends Error {}
exports.CheckoutAvailableRoomFloorError = class CheckoutAvailableRoomFloorError extends Error {}

exports.RoomIsAlreadyBookedError = class RoomIsAlreadyBookedError extends Error {
  constructor(guest, age, roomNumber, keycardNumber) {
    super();
    this.guest = guest;
    this.age = age;
    this.roomNumber = roomNumber;
    this.keycardNumber = keycardNumber;
  }
}