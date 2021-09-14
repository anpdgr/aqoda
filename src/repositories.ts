import { Room } from "./model";

export interface Repository {
  createKeycards(floor: number, roomPerFloor: number): Promise<void>;

  generateKeycard(): Promise<number>;

  getRoomByKeycardNumber(keycardNumber: number): Promise<Room | null>;

  getRoomByRoomNumber(roomNumber: string): Promise<Room | null>;

  listAvailableRooms(): Promise<Room[]>;

  createRooms(floor: number, roomPerFloor: number): Promise<void>;

  listBookedRoom(): Promise<Room[]>;

  returnKeycard(room: Room): Promise<void>;

  listRooms(): Promise<Room[]>;

  saveRoom(updatedRoom: Room): Promise<void>;
}
