const { Room, Guest } = require("./model");
const createClient = require("./firestore-client");

function createRepositories() {
  const firestoreClient = createClient();
  
  async function createKeycards(floor, roomPerFloor) {
    const numberOfKeycard = floor * roomPerFloor;
    const batch = firestoreClient.batch();
    for (let count = 1; count <= numberOfKeycard; count++) {
      const ref = firestoreClient.collection("keycards").doc(count.toString());
      const data = { number: count };
      batch.create(ref, data);
    }
    await batch.commit();
  }
  
  async function generateKeycard() {
    const querySnapshot = await firestoreClient
      .collection("keycards")
      .orderBy("number", "asc")
      .limit(1)
      .get();
    const snapshot = querySnapshot.docs[0];
    const ref = snapshot.ref;
    const data = snapshot.data();
    const number = data.number;
    await ref.delete();
    return number;
  }
  
  async function getRoomByKeycardNumber(keycardNumber) {
    const querySnapshot = await firestoreClient
      .collection("rooms")
      .where("keycard", "==", keycardNumber)
      .get();
    return querySnapshot.docs.map((snapshot) => {
      const data = snapshot.data();
      return new Room(
        data.number,
        data.floor,
        data.keycard,
        data.guestName && data.guestAge
          ? new Guest(data.guestName, data.guestAge)
          : null
      );
    })[0];
  }
  
  async function getRoomByRoomNumber(roomNumber) {
    const ref = firestoreClient.collection("rooms").doc(roomNumber.toString());
    const snapshot = await ref.get();
    const data = snapshot.data();
  
    return new Room(
      data.number,
      data.floor,
      data.keycard,
      data.guestName && data.guestAge
        ? new Guest(data.guestName, data.guestAge)
        : null
    );
  }
  
  async function listAvailableRooms() {
    const querySnapshot = await firestoreClient
      .collection("rooms")
      .where("keycard", "==", null)
      .where("guestName", "==", null)
      .where("guestAge", "==", null)
      .get();
    return querySnapshot.docs.map((snapshot) => {
      const data = snapshot.data();
      return new Room(
        data.number,
        data.floor,
        data.keycard,
        data.guestName && data.guestAge
          ? new Guest(data.guestName, data.guestAge)
          : null
      );
    });
  }
  
  async function createRooms(floor, roomPerFloor) {
    //set all room num
    const batch = firestoreClient.batch();
    for (let floorCount = 1; floorCount <= floor; floorCount++) {
      for (let roomCount = 1; roomCount <= roomPerFloor; roomCount++) {
        if (!roomCount.toString()[1]) {
          //f01-f09
          roomNumber = floorCount.toString() + "0" + roomCount.toString();
        } else {
          //f10-f99
          roomNumber = floorCount.toString() + roomCount.toString();
        }
        const ref = firestoreClient
          .collection("rooms")
          .doc(roomNumber.toString());
        const data = { number: roomNumber, floor: floorCount, keycard: null, guestName: null, guestAge: null };
        batch.create(ref, data);
      }
    }
    await batch.commit();
  }
  
  async function listBookedRoom() {
    const querySnapshot = await firestoreClient
      .collection("rooms")
      .where("keycard", "!=", null)
      .get();
    return querySnapshot.docs.map((snapshot) => {
      const data = snapshot.data();
      return new Room(
        data.number,
        data.floor,
        data.keycard,
        new Guest(data.guestName, data.guestAge)
      );
    });
  }
  
  async function returnKeycard(room) {
    const ref = firestoreClient.collection("keycards").doc(room.keycardNumber.toString());
    await ref.set({number: room.keycardNumber});
  }
  
  async function listRooms() {
    const querySnapshot = await firestoreClient.collection("rooms").get();
    return querySnapshot.docs.map((snapshot) => {
      const data = snapshot.data();
      return new Room(
        data.number,
        data.floor,
        data.keycard,
        data.guestName && data.guestAge
          ? new Guest(data.guestName, data.guestAge)
          : null
      );
    });
  }
  
  async function saveRoom(updatedRoom) {
    const ref = firestoreClient.collection("rooms").doc(updatedRoom.roomNumber.toString());
    if(updatedRoom.keycardNumber === null && updatedRoom.guest === null) {
      await ref.update({
        keycard: null,
        guestName: null,
        guestAge: null
      });
    } else {
      await ref.update({
        keycard: updatedRoom.keycardNumber,
        guestName: updatedRoom.guest.name,
        guestAge: updatedRoom.guest.age,
      });
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

