import createPrismaClient from "./prisma-client";
import { Room, Guest } from "./model";
import { Repository } from "./repositories";

class PrismaRepository implements Repository {
  constructor(private prismaClient: ReturnType<typeof createPrismaClient>) {
    
  }

  async createKeycards(floor: number, roomPerFloor: number): Promise<void> {
    //set all possible keycard number DESC
    const numberOfKeycard: number = floor * roomPerFloor;
    for (let count: number = 1; count <= numberOfKeycard; count++) {
      await this.prismaClient.keycards.createMany({ data: { number: count } });
    }
  }

  async generateKeycard(): Promise<number> {
    const result = await this.prismaClient.keycards.findFirst({
      orderBy: { number: "asc" },
    });
    await this.prismaClient.keycards.delete({ where: { number: result!.number } });
    return result!.number;
  }

  async getRoomByKeycardNumber(keycardNumber: number): Promise<Room | null> {
    const room = await this.prismaClient.rooms.findFirst({
      where: { keycard: keycardNumber },
    });
    return room
      ? new Room(
          room.number,
          room.floor,
          room.keycard ?? undefined,
          room.guestName && room.guestAge
            ? new Guest(room.guestName, room.guestAge)
            : undefined
        )
      : null;
  }

  async getRoomByRoomNumber(roomNumber: string): Promise<Room | null> {
    const room = await this.prismaClient.rooms.findFirst({
      where: { number: roomNumber },
    });
    return room
      ? new Room(
          room.number,
          room.floor,
          room.keycard ?? undefined,
          room.guestName && room.guestAge
            ? new Guest(room.guestName, room.guestAge)
            : undefined
        )
      : null;
  }

  async listAvailableRooms(): Promise<Room[]> {
    const result = await this.prismaClient.rooms.findMany({
      where: { keycard: null, guestName: null, guestAge: null },
    });

    return result.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard ?? undefined,
          row.guestName && row.guestAge
          ? new Guest(row.guestName, row.guestAge)
          : undefined
        )
    );
  }

  async createRooms(floor: number, roomPerFloor: number): Promise<void> {
    let roomNumber: string;
    //set all room num
    for (let floorCount: number = 1; floorCount <= floor; floorCount++) {
      for (let roomCount: number = 1; roomCount <= roomPerFloor; roomCount++) {
        if (!roomCount.toString()[1]) {
          //f01-f09
          roomNumber = floorCount.toString() + "0" + roomCount.toString();
        } else {
          //f10-f99
          roomNumber = floorCount.toString() + roomCount.toString();
        }
        await this.prismaClient.rooms.create({
          data: { number: roomNumber, floor: floorCount },
        });
      }
    }
  }

  async listBookedRoom(): Promise<Room[]> {
    const result = await this.prismaClient.rooms.findMany({
      orderBy: { keycard: "asc" },
      where: { NOT: { keycard: null, guestName: null, guestAge: null } },
    });

    return result.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard ?? undefined,
          row.guestName && row.guestAge
          ? new Guest(row.guestName, row.guestAge)
          : undefined
        )
    );
  }

  async returnKeycard(room: Room): Promise<void> {
    await this.prismaClient.keycards.create({
      data: { number: room.keycardNumber! },
    });
  }

  async listRooms(): Promise<Room[]> {
    const result = await this.prismaClient.rooms.findMany();

    return result.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard ?? undefined,
          row.guestName && row.guestAge
          ? new Guest(row.guestName, row.guestAge)
          : undefined
        )
    );
  }

  async saveRoom(updatedRoom: Room): Promise<void> {
    if (updatedRoom.guest === undefined) {
      await this.prismaClient.rooms.update({
        where: { number: updatedRoom.roomNumber },
        data: {
          keycard: null,
          guestName: null,
          guestAge: null,
        },
      });
    } else {
      await this.prismaClient.rooms.update({
        where: { number: updatedRoom.roomNumber },
        data: {
          keycard: updatedRoom.keycardNumber,
          guestName: updatedRoom.guest?.name,
          guestAge: updatedRoom.guest?.age,
        },
      });
    }
  }
}

export default function createRepositories(prismaClient: ReturnType<typeof createPrismaClient>): Repository{
  return new PrismaRepository(prismaClient);
}
