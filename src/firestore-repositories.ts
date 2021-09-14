import createFirestoreClient from "./firestore-client";
import { Room, Guest } from "./model";
import { Repository } from "./repositories";

type RoomEntity = {
  number: string;
  floor: number;
  keycard?: number;
  guestName?: string;
  guestAge?: number;
};

type AvailableRoomEntity = {
  number: string;
  floor: number;
  keycard?: null;
  guestName?: null;
  guestAge?: null;
};

type keycardEntity = {
  number: number;
};

class FirestoreRepository implements Repository {
  constructor(private firestoreClient: ReturnType<typeof createFirestoreClient>) {
    
  }

  async createKeycards(floor: number, roomPerFloor: number) {
    const numberOfKeycard: number = floor * roomPerFloor;
    const batch: FirebaseFirestore.WriteBatch =  this.firestoreClient.batch();
    for (let count: number = 1; count <= numberOfKeycard; count++) {
      const ref =  this.firestoreClient.collection("keycards").doc(count.toString());
      const data = { number: count };
      batch.create(ref, data);
    }
    await batch.commit();
  }

  async generateKeycard(): Promise<number> {
    const querySnapshot = await this.firestoreClient
      .collection("keycards")
      .orderBy("number", "asc")
      .limit(1)
      .get();
    const snapshot = querySnapshot.docs[0];
    const ref = snapshot.ref;
    const data = snapshot.data() as keycardEntity;
    const number: number = data.number;
    await ref.delete();
    return number;
  }

  async getRoomByKeycardNumber(keycardNumber: number): Promise<Room> {
    const querySnapshot = await this.firestoreClient
      .collection("rooms")
      .where("keycard", "==", keycardNumber)
      .get();
    return querySnapshot.docs.map((snapshot) => {
      const data = snapshot.data() as RoomEntity;
      return new Room(
        data.number,
        data.floor,
        data.keycard,
        data.guestName && data.guestAge
          ? new Guest(data.guestName, data.guestAge)
          : undefined
      );
    })[0];
  }

  async getRoomByRoomNumber(roomNumber: string): Promise<Room | null> {
    const ref =  this.firestoreClient.collection("rooms").doc(roomNumber.toString());
    const snapshot = await ref.get();
    const data = snapshot.data() as RoomEntity;

    return new Room(
      data.number,
      data.floor,
      data.keycard,
      data.guestName && data.guestAge
        ? new Guest(data.guestName, data.guestAge)
        : undefined
    );
  }

  async listAvailableRooms(): Promise<Room[]> {
    const querySnapshot = await this.firestoreClient
      .collection("rooms")
      .where("keycard", "==", null)
      .where("guestName", "==", null)
      .where("guestAge", "==", null)
      .get();
    return querySnapshot.docs.map((snapshot) => {
      const data = snapshot.data() as RoomEntity;
      return new Room(
        data.number,
        data.floor,
        data.keycard,
        data.guestName && data.guestAge
          ? new Guest(data.guestName, data.guestAge)
          : undefined
      );
    });
  }

  async createRooms(
    floor: number,
    roomPerFloor: number
  ): Promise<void> {
    //set all room num
    const batch =  this.firestoreClient.batch();
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
        const ref = this.firestoreClient
          .collection("rooms")
          .doc(roomNumber.toString());
        const data = {
          number: roomNumber,
          floor: floorCount,
          keycard: null,
          guestName: null,
          guestAge: null,
        } as AvailableRoomEntity;
        batch.create(ref, data);
      }
    }
    await batch.commit();
  }

  async listBookedRoom(): Promise<Room[]> {
    const querySnapshot = await this.firestoreClient
      .collection("rooms")
      .where("keycard", "!=", null)
      .get();
    return querySnapshot.docs.map((snapshot) => {
      const data = snapshot.data() as RoomEntity;
      return new Room(
        data.number,
        data.floor,
        data.keycard,
        data.guestName && data.guestAge
          ? new Guest(data.guestName, data.guestAge)
          : undefined
      );
    });
  }

  async returnKeycard(room: Room): Promise<void> {
    const ref = this.firestoreClient
      .collection("keycards")
      .doc(room.keycardNumber!.toString());
    await ref.set({ number: room.keycardNumber });
  }

  async listRooms() {
    const querySnapshot = await  this.firestoreClient.collection("rooms").get();
    return querySnapshot.docs.map((snapshot) => {
      const data = snapshot.data() as RoomEntity;
      return new Room(
        data.number,
        data.floor,
        data.keycard,
        data.guestName && data.guestAge
          ? new Guest(data.guestName, data.guestAge)
          : undefined
      );
    });
  }

  async saveRoom(updatedRoom: Room) {
    const ref = this.firestoreClient
      .collection("rooms")
      .doc(updatedRoom.roomNumber.toString());
    if (updatedRoom.keycardNumber === undefined && updatedRoom.guest === undefined) {
      await ref.update({
        keycard: null,
        guestName: null,
        guestAge: null,
      });
    } else {
      await ref.update({
        keycard: updatedRoom.keycardNumber,
        guestName: updatedRoom.guest?.name,
        guestAge: updatedRoom.guest?.age,
      });
    }
  }
}

export default function createRepositories(
  firestoreClient: ReturnType<typeof createFirestoreClient>
): Repository {
  return new FirestoreRepository(firestoreClient);
}



// module.exports = createRepositories;
