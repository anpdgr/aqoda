const { keycards, allRooms } = require("./localdb");
const { Room, Guest } = require("./model");

function createRepositories(postgresClient) {

  async function createKeycards(floor, roomPerFloor) {
    //set all possible keycard number DESC
    const numberOfKeycard = floor * roomPerFloor;
    const value = [];
    let sql = 'INSERT INTO "public"."keycards" ("number") VALUES ';
    for (let count = 1; count <= numberOfKeycard; count++) {
      sql += `($${count})`;
      if (count === numberOfKeycard) {
        sql += ";";
      } else {
        sql += ",";
      }
      value.push(count);
    }
    await postgresClient.query(sql, value);
  }
  
  async function generateKeycard() {
    const sqlSelect = `SELECT "number" FROM "keycards" ORDER BY "number" LIMIT 1`
    const result = await postgresClient.query(sqlSelect);
    const sqlDelete = 'DELETE FROM keycards WHERE "number" = $1'
    await postgresClient.query(sqlDelete, [result.rows[0].number]);
    return result.rows[0].number
  }
  
  async function getRoomByKeycardNumber(keycardNumber) {
    sql = 'SELECT * FROM "rooms" WHERE "keycard" = $1;'
    const result = await postgresClient.query(sql, [keycardNumber]);
    return result.rows.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          row.guestName && row.guestAge ? new Guest(row.guestName, row.guestAge) : null
        )
    )[0];
    // return allRooms.find((room) => room.keycardNumber === keycardNumber);
  }
  
  async function getRoomByRoomNumber(roomNumber) {
    const sql = `SELECT * FROM "rooms" WHERE "number" = $1`
  
    const result = await postgresClient.query(sql, [roomNumber]);
    // console.log(result.rows);
    return result.rows.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          row.guestName && row.guestAge ? new Guest(row.guestName, row.guestAge) : null
        )
    )[0];
  }
  
  async function listAvailableRooms() {
    sql = 'SELECT * FROM "rooms" WHERE "keycard" IS NULL AND "guestName" IS NULL AND "guestAge" IS NULL;'
    const result = await postgresClient.query(sql);
    // console.log(result.rows);
    return result.rows.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          row.guestName && row.guestAge ? new Guest(row.guestName, row.guestAge) : null
        )
    );
  }
  
  async function createRooms(floor, roomPerFloor) {
    //set all room num
    let sql = 'INSERT INTO "public"."rooms" ("number", "floor") VALUES';
    let counter1 = 1;
    const value = [];
    for (let floorCount = 1; floorCount <= floor; floorCount++) {
      for (let roomCount = 1; roomCount <= roomPerFloor; roomCount++) {
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
  
    allRooms.forEach((room, index) => {
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
    await postgresClient.query(sql, value);
  }
  
  async function listBookedRoom() {
    let sql =
      'SELECT * FROM "public"."rooms" WHERE "keycard" IS NOT NULL AND "guestName" IS NOT NULL AND "guestAge" IS NOT NULL ORDER BY "keycard" ASC;';
    const result = await postgresClient.query(sql);
    return result.rows.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          new Guest(row.guestName, row.guestAge)
        )
    );
  }
  
  async function returnKeycard(room) {
    const sql = 'INSERT INTO "keycards"("number") VALUES ($1)'
    await postgresClient.query(sql, [room.keycardNumber]);
  }
  
  async function listRooms() {
    let sql =
      'SELECT * FROM "public"."rooms";';
    const result = await postgresClient.query(sql);
    return result.rows.map(
      (row) =>
        new Room(
          row.number,
          row.floor,
          row.keycard,
          new Guest(row.guestName, row.guestAge)
        )
    );
  }
  
  async function saveRoom(updatedRoom) {
    const sql = 'UPDATE "public"."rooms" SET "keycard" = $1, "guestName" = $2, "guestAge" = $3 WHERE "number" = $4;'
    if(updatedRoom.guest === null) {
      await postgresClient.query(sql, [updatedRoom.keycardNumber, null, null, updatedRoom.roomNumber]);
    }
    else {
      await postgresClient.query(sql, [updatedRoom.keycardNumber, updatedRoom.guest.name, updatedRoom.guest.age, updatedRoom.roomNumber]);
    }
  }
  
  return {
    createKeycards,
    generateKeycard,
    getRoomByRoomNumber,
    listAvailableRooms,
    createRooms,
    listBookedRoom,
    getRoomByKeycardNumber,
    returnKeycard,
    listRooms,
    saveRoom,
  };
}

module.exports = createRepositories;