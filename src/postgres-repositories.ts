import { allRooms } from "./localdb";
import { Room, Guest } from "./model";
import createPostgresClient from "./postgres-client";
import { Repository } from "./repositories";

type RoomEntity = {
  number: string;
  floor: number;
  keycard?: number;
  guestName?: string ;
  guestAge?: number;
};

type keycardEntity = {
  number: number
}

class PostgresRepository implements Repository {
  constructor(private postgresClient: ReturnType<typeof createPostgresClient>) {
    
  }

  async createKeycards(floor: number, roomPerFloor: number): Promise<void> {
    //set all possible keycard number DESC
    const numberOfKeycard: number = floor * roomPerFloor;
    const value: number[] = [];
    let sql: string = 'INSERT INTO "public"."keycards" ("number") VALUES ';
    let count: number;
    for (count = 1; count <= numberOfKeycard; count++) {
      sql += `($${count})`;
      if (count === numberOfKeycard) {
        sql += ";";
      } else {
        sql += ",";
      }
      value.push(count);
    }
    await this.postgresClient.query<keycardEntity>(sql, value);
  }

  async generateKeycard(): Promise<number> {
    const sqlSelect: string = `SELECT "number" FROM "keycards" ORDER BY "number" LIMIT 1`;
    const result = await this.postgresClient.query<keycardEntity>(sqlSelect);
    const sqlDelete: string = 'DELETE FROM keycards WHERE "number" = $1';
    await this.postgresClient.query<keycardEntity>(sqlDelete, [result.rows[0].number]);
    return result.rows[0].number;
  }

  async getRoomByKeycardNumber(keycardNumber: number): Promise<Room> {
    const sql: string = 'SELECT * FROM "rooms" WHERE "keycard" = $1;';
    const result = await this.postgresClient.query<RoomEntity>(sql, [keycardNumber]);
    return result.rows.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          row.guestName && row.guestAge
            ? new Guest(row.guestName, row.guestAge)
            : undefined
        )
    )[0];
  }

  async getRoomByRoomNumber(roomNumber: string): Promise<Room> {
    const sql: string = `SELECT * FROM "rooms" WHERE "number" = $1`;

    const result = await this.postgresClient.query<RoomEntity>(sql, [roomNumber]);
    return result.rows.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          row.guestName && row.guestAge
            ? new Guest(row.guestName, row.guestAge)
            : undefined
        )
    )[0];
  }

  async listAvailableRooms(): Promise<Room[]> {
    const sql: string =
      'SELECT * FROM "rooms" WHERE "keycard" IS NULL AND "guestName" IS NULL AND "guestAge" IS NULL;';
    const result = await this.postgresClient.query<RoomEntity>(sql);
    // console.log(result.rows);
    return result.rows.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          row.guestName && row.guestAge
            ? new Guest(row.guestName, row.guestAge)
            : undefined
        )
    );
  }

  async createRooms(floor: number, roomPerFloor: number): Promise<void> {
    //set all room num
    let sql: string = 'INSERT INTO "public"."rooms" ("number", "floor") VALUES';
    let counter1: number = 1;
    const value: (number|string)[] = [];
    let roomNumber: string;
    for (let floorCount: number = 1; floorCount <= floor; floorCount++) {
      for (let roomCount: number = 1; roomCount <= roomPerFloor; roomCount++) {
        if (!roomCount.toString()[1]) {
          //f01-f09
          roomNumber = floorCount.toString() + "0" + roomCount.toString();
        } else {
          //f10-f99
          roomNumber = floorCount.toString() + roomCount.toString();
        }
        allRooms.push(new Room(roomNumber, floorCount));
      }
    }

    allRooms.forEach((room: Room, index: number) => {
      sql += `($${counter1}, $${counter1 + 1})`;
      if (index === allRooms.length - 1) {
        sql += ";";
      } else {
        sql += ",";
      }
      counter1 = counter1 + 2;
      /*
        INSERT INTO "public"."rooms" ("number", "floor") VALUES ($1, $2), ($3, $4), ($5, $6);
        */
      value.push(room.roomNumber, room.floor);
    });
    await this.postgresClient.query<RoomEntity>(sql, value);
  }

  async listBookedRoom(): Promise<Room[]> {
    let sql: string =
      'SELECT * FROM "public"."rooms" WHERE "keycard" IS NOT NULL AND "guestName" IS NOT NULL AND "guestAge" IS NOT NULL ORDER BY "keycard" ASC;';
    const result = await this.postgresClient.query<RoomEntity>(sql);
    return result.rows.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          row.guestName && row.guestAge
            ? new Guest(row.guestName, row.guestAge)
            : undefined
          // new Guest(row.guestName, row.guestAge) 
        )
    );
  }

  async returnKeycard(room: Room): Promise<void> {
    const sql: string = 'INSERT INTO "keycards"("number") VALUES ($1)';
    await this.postgresClient.query<keycardEntity>(sql, [room.keycardNumber]);
  }

  async listRooms(): Promise<Room[]> {
    let sql: string = 'SELECT * FROM "public"."rooms";';
    const result = await this.postgresClient.query<RoomEntity>(sql);
    return result.rows.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          row.guestName && row.guestAge
            ? new Guest(row.guestName, row.guestAge)
            : undefined
          // new Guest(row.guestName, row.guestAge)
        )
    );
  }

  async saveRoom(updatedRoom: Room): Promise<void> {
    const sql: string =
      'UPDATE "public"."rooms" SET "keycard" = $1, "guestName" = $2, "guestAge" = $3 WHERE "number" = $4;';
    if (updatedRoom.guest === null) {
      await this.postgresClient.query<RoomEntity>(sql, [
        updatedRoom.keycardNumber,
        null,
        null,
        updatedRoom.roomNumber,
      ]);
    } else {
      await this.postgresClient.query<RoomEntity>(sql, [
        updatedRoom.keycardNumber,
        updatedRoom.guest?.name,
        updatedRoom.guest?.age,
        updatedRoom.roomNumber,
      ]);
    }
  }
}


export default function createRepositories(postgresClient: ReturnType<typeof createPostgresClient>): Repository{
  return new PostgresRepository(postgresClient);
}

