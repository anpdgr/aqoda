const fs = require("fs");
// const createApplication = require("./cli-controller");
const createApplication = require("./cli-controller");
const createService = require("./services.js");

class Command {
  constructor(name, params) {
    this.name = name;
    this.params = params;
  }
}

// const postgresClient = require("./postgres-client");
// const prismaClient = require("./prisma-client");
const createPostgresRepositories = require("./postgres-repositories");
const createPrismaRepositories = require("./prisma-repositories");
const createFirestoreRepositories = require("./firestore-repositories");

async function main() {
  const fileName = "input.txt";
  const commands = getCommandsFromFileName(fileName);

  let repositories;
  const repoInput = process.argv[2];
  //DONE: refactor to dict
  let createRepositories = {
    postgres: createPostgresRepositories(),
    prisma: createPrismaRepositories(),
    firebase: createFirestoreRepositories(),
  };
  repositories = createRepositories[repoInput];
  const services = createService(repositories);

  const application = createApplication(services);
  await commands.reduce(async (initial, command) => {
    await initial;
    switch (command.name) {
      case "create_hotel": {
        await application.createHotel(command);

        break;
      }

      case "book": {
        await application.book(command);

        break;
      }

      case "book_by_floor": {
        await application.bookByFloor(command);

        break;
      }

      case "checkout": {
        await application.checkout(command);

        break;
      }

      case "checkout_guest_by_floor": {
        await application.checkoutGuestByFloor(command);

        break;
      }

      case "list_available_rooms": {
        await application.listAvailableRooms(command);

        break;
      }

      case "list_guest": {
        await application.listGuests(command);

        break;
      }

      case "list_guest_by_age": {
        await application.listGuestsByAge(command);

        break;
      }

      case "list_guest_by_floor": {
        await application.listGuestsByFloor(command);
        break;
      }

      case "get_guest_in_room": {
        await application.getGuestsInRoom(command);
        break;
      }

      default: {
        console.log("Invalid Command");
        break;
      }
    }
    return Promise.resolve();
  }, Promise.resolve());
  //TODO: คิดวิธี ทำไงก้ได้
  // await prismaClient.$disconnect();
  // await postgresClient.end();
}

function getCommandsFromFileName(fileName) {
  const file = fs.readFileSync(fileName, "utf-8");
  return file
    .split("\n")
    .map((line) => line.split(" "))
    .map(
      ([commandName, ...params]) =>
        new Command(
          commandName.trim(),
          params.map((param) => {
            param = param.trim();
            const parsedParam = parseInt(param, 10);
            return Number.isNaN(parsedParam) ? param : parsedParam;
          })
        )
    );
}

//DONE: createApp -> createController, move file, รับ services from main

main();
