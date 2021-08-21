const fs = require('fs')

class Command {
  constructor(name, params) {
    this.name = name;
    this.params = params;
  }
}

class Room {
  constructor(roomNumber, floor, keycardNumber, guest, age) {
    this.roomNumber = roomNumber;
    this.floor = floor;
    this.keycardNumber = keycardNumber;
    this.guest = guest;
    this.age = age;
  }
}

const bookedRooms = [];
let availableRooms = [];
const allRooms = [];
const keycards = [];

function main() {
  const fileName = 'input.txt';
  const commands = getCommandsFromFileName(fileName);

  commands.forEach(command => {
    //find available room
    const bookedRoomNumbers = [];

    bookedRooms.forEach(room => {
      bookedRoomNumbers.push(room.roomNumber);
    });
    availableRooms = allRooms.filter(room => !bookedRoomNumbers.includes(room));

    switch (command.name) {
      case 'create_hotel': {
        const [floor, roomPerFloor] = command.params;
        const hotel = { floor, roomPerFloor };

        if (roomPerFloor > 99) return console.log('Can not create hotel with 100 or more rooms per floor');

        //set all possible keycard number DESC
        numberOfKeycard = floor * roomPerFloor;

        for (let count = numberOfKeycard; count >= 1; count--) {
          keycards.push(count);
        }

        //set all room num
        for (let floorCount = 1; floorCount <= floor; floorCount++) {
          for (let roomCount = 1; roomCount <= roomPerFloor; roomCount++) {
            if (roomCount.toString()[1] === undefined) { //f01-f09
              roomNumber = floorCount.toString() + '0' + roomCount.toString();
            }
            else { //f10-f99
              roomNumber = floorCount.toString() + roomCount.toString();
            }

            allRooms.push(Number(roomNumber));
          }
        }

        console.log(
          `Hotel created with ${floor} floor(s), ${roomPerFloor} room(s) per floor.`
        );
        break;
      }

      case 'book': {
        //book 203 Thor 32
        const [roomNumber, guest, age] = command.params;

        //console.log(bookedRoomNumbers.length)
        if (bookedRoomNumbers.length === allRooms.length) {
          return console.log('Hotel is fully booked.');
        }

        filteredRoom = findRoomByRoomNumber(roomNumber);
        if (filteredRoom === 0) { //room is available -> book
          //book
          keycardNumber = keycards.pop();
          bookedRooms.push(new Room(roomNumber, Number(roomNumber.toString()[0]), keycardNumber, guest, age));

          console.log(`Room ${roomNumber} is booked by ${guest} with keycard number ${keycardNumber}.`);
        }
        else {         
          console.log(`Cannot book room ${roomNumber} for ${guest}, The room is currently booked by ${filteredRoom.guest}.`);
        }
        break;
      }

      case 'book_by_floor': {
        //book_by_floor 1 TonyStark 48
        const [floor, guest, age] = command.params;

        if (!isRoomBookedByFloor(floor)) { //all room on that floor are available -> book all     
          //book
          //create array of all roomNumbers on that floor
          const roomsOnFloor = availableRooms.filter(roomNumber => roomNumber.toString()[0] == floor);
          //create array of all keycardNumbers
          const keycardNumbersOnFloor = [];

          for (let roomCount = 0; roomCount < roomsOnFloor.length; roomCount++) {
            keycardNumbersOnFloor.push(keycards.pop());
          }

          //create obj
          for (let roomCount = 0; roomCount < roomsOnFloor.length; roomCount++) {
            bookedRooms.push(new Room(roomsOnFloor[roomCount], floor, keycardNumbersOnFloor[roomCount], guest, age));
          }

          console.log(`Room ${roomsOnFloor.join(', ')} are booked with keycard number ${keycardNumbersOnFloor.join(', ')}`);
        }
        else {                         
          console.log(`Cannot book floor ${floor} for ${guest}.`);
        }
        break;
      }

      case 'checkout': {
        //checkout 4 TonyStark
        const [keycardNumber, guest] = command.params;

        filteredRoom = findRoomByKeycardNumber(keycardNumber);
        if (filteredRoom != 0) { //there is the room that booked with this keycard number
          //console.log(`ftr = ${filteredRoom.guest.length}, co = ${co_guest.trim().length}`)
          if (filteredRoom.guest === guest) { //name match with keycardNumber
            //checkout
            //delete that room by index
            bookedRooms.splice(bookedRooms.indexOf(filteredRoom),1);
            //push keycard back
            keycards.push(filteredRoom.keycardNumber);

            console.log(`Room ${filteredRoom.roomNumber} is checkout.`);
          }
          else {
            console.log(`Only ${filteredRoom.guest} can checkout with keycard number ${filteredRoom.keycardNumber}.`);
          }
        }
        else {
          console.log('You can not checkout available room');
        }
        break;
      }

      case 'checkout_guest_by_floor': {
        //checkout_guest_by_floor 1
        const [floor] = command.params;

        if (isRoomBookedByFloor(floor)) { //there is some room on that floor was booked  
          //checkout that room
          //create array of all booked roomNum on that floor
          const roomsOnFloor = bookedRoomNumbers.filter(roomNumber => roomNumber.toString()[0] == floor);

          for (let roomCount = 0; roomCount < roomsOnFloor.length; roomCount++) {
            //find index
            indexRoom = bookedRooms.indexOf(findRoomByRoomNumber(roomsOnFloor[roomCount]));
            //push keycard back
            keycards.push(bookedRooms[indexRoom].keycardNumber);
            //delete room
            bookedRooms.splice(indexRoom, 1);
          }

          console.log(`Room ${roomsOnFloor.join(', ')} are checkout.`);
        }
        else {                         
          console.log(`No room on floor ${floor} was booked.`);
        }
        break;
      }

      case 'list_available_rooms': {
        console.log(availableRooms.join(', '));
        break;
      }

      case 'list_guest': {
        //list_guest
        allGuests = [];

        bookedRooms.forEach(room => {
          if (!allGuests.find(guest => guest === room.guest)) allGuests.push(room.guest);
        });

        console.log(allGuests.join(', '));
        break;
      }

      case 'list_guest_by_age': {
        //list_guest_by_age < 18
        const [operation, age] = command.params;
        guestsByAge = [];

        bookedRooms.forEach(room => {
          if (eval(room.age+operation+age)) {
            if (!guestsByAge.find(guest => guest === room.guest)) guestsByAge.push(room.guest);
          }
        })

        console.log(guestsByAge.join(', '));
        break;
      }

      case 'list_guest_by_floor': {
        //list_guest_by_floor 2
        const [floor] = command.params;
        guestsByFloor = [];

        bookedRooms.forEach(room => {
          if (room.floor === floor) if (!guestsByFloor.find(guest => guest === room.guest)) guestsByFloor.push(room.guest);
        });

        console.log(guestsByFloor.join(', '));
        break;
      }

      case 'get_guest_in_room': {
        //get_guest_in_room 203
        const [room] = command.params;

        console.log(findRoomByRoomNumber(room).guest);
        break;
      }
      
      default: {
        console.log('Invalid Command');
        break;
      }
    }
  })
}


function isRoomBookedByFloor(floor) {
  result = false;

  bookedRooms.forEach(room => room.floor === floor ? result = true : '');

  return result;
}

function findRoomByKeycardNumber(keycardNumber) {
  filteredRoom = 0;

  bookedRooms.forEach(room => {
    if (room.keycardNumber === keycardNumber) filteredRoom = room;
  });

  return filteredRoom;
}

function findRoomByRoomNumber(roomNumber) {
  filteredRoom = 0;

  bookedRooms.forEach(room => {
    if (room.roomNumber === roomNumber) filteredRoom = room;
  });

  return filteredRoom;
}


function getCommandsFromFileName(fileName) {
  const file = fs.readFileSync(fileName, 'utf-8')
  return file
    .split('\n')
    .map(line => line.split(' '))
    .map(
      ([commandName, ...params]) =>
        new Command(
          commandName.trim(),
          params.map(param => {
            param=param.trim()
            const parsedParam = parseInt(param, 10)
            return Number.isNaN(parsedParam) ? param : parsedParam
          })
        )
    )
}

main()