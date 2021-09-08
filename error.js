"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomIsAlreadyBookedError = exports.CheckoutAvailableRoomFloorError = exports.CheckoutAvailableRoomError = exports.GuestNotMatchKeycardNumberError = exports.RoomFloorIsAlreadyBookedError = exports.HotelIsFullError = exports.ApplicationError = void 0;
class ApplicationError extends Error {
}
exports.ApplicationError = ApplicationError;
class HotelIsFullError extends ApplicationError {
    constructor() {
        super(...arguments);
        this.message = "Hotel is fully booked.";
    }
}
exports.HotelIsFullError = HotelIsFullError;
class RoomFloorIsAlreadyBookedError extends ApplicationError {
    constructor(floor, guest) {
        super();
        this.floor = floor;
        this.guest = guest;
    }
}
exports.RoomFloorIsAlreadyBookedError = RoomFloorIsAlreadyBookedError;
class GuestNotMatchKeycardNumberError extends ApplicationError {
    constructor(room) {
        super();
        this.room = room;
    }
}
exports.GuestNotMatchKeycardNumberError = GuestNotMatchKeycardNumberError;
class CheckoutAvailableRoomError extends ApplicationError {
}
exports.CheckoutAvailableRoomError = CheckoutAvailableRoomError;
class CheckoutAvailableRoomFloorError extends ApplicationError {
}
exports.CheckoutAvailableRoomFloorError = CheckoutAvailableRoomFloorError;
class RoomIsAlreadyBookedError extends ApplicationError {
    constructor(room, guest) {
        super();
        this.room = room;
        this.guest = guest;
        this.message = `Cannot book room ${this.room.roomNumber} for ${this.guest.name}, The room is currently booked by ${this.room.guest?.name}.`;
    }
}
exports.RoomIsAlreadyBookedError = RoomIsAlreadyBookedError;
