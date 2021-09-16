import { Guest, Room } from "./model";

export class ApplicationError extends Error {code = "400";}

export class HotelIsFullError extends ApplicationError {
  message = "Hotel is fully booked.";
}
export class RoomFloorIsAlreadyBookedError extends ApplicationError {
  message = `Cannot book floor ${this.floor} for ${this.guest.name}.`;
  constructor(public floor: number, public guest: Guest) {
    super();
  }
}
export class GuestNotMatchKeycardNumberError extends ApplicationError {
  message = `Only ${this.room.guest?.name} can checkout with keycard number ${this.keycardNumber}.`;
    constructor(public room: Room, public keycardNumber: number) {
      super();
    }
}
export class CheckoutAvailableRoomError extends ApplicationError {
  message = "You can not checkout available room";
}
export class CheckoutAvailableRoomFloorError extends ApplicationError {
  message = `No room on floor ${this.floor} was booked.`;
  constructor(public floor: number) {
    super();
  }
}

export class RoomIsAlreadyBookedError extends ApplicationError {
  message = `Cannot book room ${this.room.roomNumber} for ${this.guest.name}, The room is currently booked by ${this.room.guest?.name}.`;
  constructor(public room: Room, public guest: Guest) {
    super();
  }
}


