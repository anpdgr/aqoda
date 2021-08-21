const fs = require('fs')

class Command {
  constructor(name, params) {
    this.name = name
    this.params = params
  }
}

class Room {
  constructor(room, floor, keycardNumber, guest, age) {
    this.room = room
    this.floor = floor
    this.keycardNumber = keycardNumber
    this.guest = guest
    this.age = age
  }
}

const bookedRoom = []
let avalRoom = []
const allRoom = []
const keycard = []

function main() {
  const fileName = 'input.txt'
  const commands = getCommandsFromFileName(fileName)

  commands.forEach(command => {
    //find available room
    const bookedRoomNum = []

    bookedRoom.forEach(eachRoom => {
      bookedRoomNum.push(eachRoom.room)
    })
    avalRoom = allRoom.filter(room => !bookedRoomNum.includes(room))

    switch (command.name) {
      case 'create_hotel':
        const [floor, roomPerFloor] = command.params
        const hotel = { floor, roomPerFloor }

        if (roomPerFloor > 99) return console.log('Can not create hotel with 100 or more rooms per floor')

        //set all possible keycard number DESC
        noKeyCard = floor * roomPerFloor

        for (let i = noKeyCard; i >= 1; i--) {
          keycard.push(i)
        }

        //set all room num
        for (let f = 1; f <= floor; f++) {
          for (let r = 1; r <= roomPerFloor; r++) {
            if (r.toString()[1] === undefined) { //f01-f09
              tempRoomNum = f.toString() + '0' + r.toString()
            }
            else { //f10-f99
              tempRoomNum = f.toString() + r.toString()
            }

            allRoom.push(Number(tempRoomNum))
          }
        }

        console.log(
          `Hotel created with ${floor} floor(s), ${roomPerFloor} room(s) per floor.`
        )
        return 

      case 'book':
        //book 203 Thor 32
        const [bRoom, bGuest, bAge] = command.params

        //console.log(bookedRoomNum.length)
        if (bookedRoomNum.length == allRoom.length) {
          return console.log('Hotel is fully booked.')
        }

        filterRoom = findByRoomNum(bRoom)
        if (filterRoom == 0) { //room is available -> book
          //book
          keyNum = keycard.pop()
          bookedRoom.push(new Room(bRoom, Number(bRoom.toString()[0]), keyNum, bGuest, bAge))

          console.log(`Room ${bRoom} is booked by ${bGuest} with keycard number ${keyNum}.`);
        }
        else {         
          console.log(`Cannot book room ${bRoom} for ${bGuest}, The room is currently booked by ${filterRoom.guest}.`)
        }
        return 

      case 'book_by_floor':
        //book_by_floor 1 TonyStark 48
        const [bbfFloor, bbfGuest, bbfAge] = command.params

        if (!isRoomBookedByFloor(bbfFloor)) { //all room on that floor are available -> book all     
          //book
          //create array of all roomNum on that floor
          const roomArr = avalRoom.filter(elem => elem.toString()[0] == bbfFloor)
          //create array of all keycardNum
          const keycardArr = [];

          for (let x = 0; x < roomArr.length; x++) {
            keycardArr.push(keycard.pop())
          }

          //create obj
          for (let x = 0; x < roomArr.length; x++) {
            bookedRoom.push(new Room(roomArr[x], bbfFloor, keycardArr[x], bbfGuest, bbfAge))
          }

          console.log(`Room ${roomArr.join(', ')} are booked with keycard number ${keycardArr.join(', ')}`)
        }
        else {                         
          console.log(`Cannot book floor ${bbfFloor} for ${bbfGuest}.`)
        }
        return

      case 'checkout':
        //checkout 4 TonyStark
        const [coKeycardNumber, coGuest] = command.params

        filterRoom = findByKeyNum(coKeycardNumber)
        if (filterRoom != 0) { //there is the room that booked with this keycard number
          //console.log(`ftr = ${filterRoom.guest.length}, co = ${co_guest.trim().length}`)
          if (filterRoom.guest == coGuest) { //name match with keyNum
            //checkout
            //delete that room by index
            bookedRoom.splice(bookedRoom.indexOf(filterRoom),1)
            //push keycard back
            keycard.push(filterRoom.keycardNumber)

            console.log(`Room ${filterRoom.room} is checkout.`)
          }
          else {
            console.log(`Only ${filterRoom.guest} can checkout with keycard number ${filterRoom.keycardNumber}.`)
          }
        }
        else {
          console.log('You can not checkout available room')
        }
        return

      case 'checkout_guest_by_floor':
        //checkout_guest_by_floor 1
        const [cobfFloor] = command.params

        if (isRoomBookedByFloor(cobfFloor)) { //there is some room on that floor was booked  
          //checkout that room
          //create array of all booked roomNum on that floor
          const roomArr = bookedRoomNum.filter(elem => elem.toString()[0] == cobfFloor)

          for (let x = 0; x < roomArr.length; x++) {
            //find index
            indexRoom = bookedRoom.indexOf(findByRoomNum(roomArr[x]))
            //push keycard back
            keycard.push(bookedRoom[indexRoom].keycardNumber)
            //delete room
            bookedRoom.splice(indexRoom, 1)
          }

          console.log(`Room ${roomArr.join(', ')} are checkout.`)
        }
        else {                         
          console.log(`No room on floor ${cobfFloor} was booked.`)
        }
        return

      case 'list_available_rooms':
        return console.log(avalRoom.join(', '))

      case 'list_guest':
        //list_guest
        allGuest = [];

        bookedRoom.forEach(eachRoom => {
          if (!allGuest.find(elem => elem == eachRoom.guest)) allGuest.push(eachRoom.guest)
        })

        return console.log(allGuest.join(', '))

      case 'list_guest_by_age':
        //list_guest_by_age < 18
        const [gbaOp, gbaNumAge] = command.params
        ageGuest = [];

        bookedRoom.forEach(eachRoom => {
          if (eval(eachRoom.age+gbaOp+gbaNumAge)) {
            if (!ageGuest.find(elem => elem == eachRoom.guest)) ageGuest.push(eachRoom.guest)
          }
        })

        return console.log(ageGuest.join(', '))

      case 'list_guest_by_floor':
        //list_guest_by_floor 2
        const [gbfFloor] = command.params
        floorGuest = [];

        bookedRoom.forEach(eachRoom => {
          if (eachRoom.floor == gbfFloor) if (!floorGuest.find(elem => elem == eachRoom.guest)) floorGuest.push(eachRoom.guest)
        })

        return console.log(floorGuest.join(', '))

      case 'get_guest_in_room':
        //get_guest_in_room 203
        const [girRoom] = command.params

        return console.log(findByRoomNum(girRoom).guest)
      
      default:
        return console.log('Invalid Command')
    }
  })
}


function isRoomBookedByFloor(floor) {
  result = false

  bookedRoom.forEach(eachRoom => eachRoom.floor == floor ? result = true : '')

  return result
}

function findByKeyNum(key) {
  filterRoom = 0

  bookedRoom.forEach(eachRoom => {
    if (eachRoom.keycardNumber == key) filterRoom = eachRoom
  })

  return filterRoom
}

function findByRoomNum(roomnum) {
  filterRoom = 0

  bookedRoom.forEach(eachRoom => {
    if (eachRoom.room == roomnum) filterRoom = eachRoom
  })

  return filterRoom
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