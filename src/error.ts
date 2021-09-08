import { Guest, Room } from "./model";

export class ApplicationError extends Error {}

export class HotelIsFullError extends ApplicationError {
  message = "Hotel is fully booked.";
}
export class RoomFloorIsAlreadyBookedError extends ApplicationError {
  constructor(public floor: number, public guest: Guest) {
    super();
  }
}
export class GuestNotMatchKeycardNumberError extends ApplicationError {
    constructor(public room: Room) {
      super();
    }
}
export class CheckoutAvailableRoomError extends ApplicationError {}
export class CheckoutAvailableRoomFloorError extends ApplicationError {}

export class RoomIsAlreadyBookedError extends ApplicationError {
  message = `Cannot book room ${this.room.roomNumber} for ${this.guest.name}, The room is currently booked by ${this.room.guest?.name}.`;
  constructor(public room: Room, public guest: Guest) {
    super();
  }
}