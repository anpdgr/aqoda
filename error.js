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
  constructor(room) {
    super();
    this.room = room;
  }
}