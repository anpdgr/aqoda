//DONE: edit import error to be able to run server.js normally
//TODO: if server.js success -> convert js to ts (client, repo)

const fs = require("fs");
const createController = require("./cli-controller");
const createService = require("./services.js");

class Command {
  constructor(name, params) {
    this.name = name;
    this.params = params;
  }
}

const createPostgresRepositories = require("./postgres-repositories");
const createPrismaRepositories = require("./prisma-repositories");
const createFirestoreRepositories = require("./firestore-repositories");
const createPostgresClient = require("./postgres-client"); // () => Client
const createPrismaClient = require("./prisma-client");
const createFirestoreClient = require("./firestore-client");

async function main() {
  const fileName = "input.txt";
  const commands = getCommandsFromFileName(fileName);

  const repoInput = process.argv[2];

  const createClients = {
    postgres: createPostgresClient,
    prisma: createPrismaClient,
    firebase: createFirestoreClient,
  };
  const client = createClients[repoInput]();

  //DONE: create disconnect
  const disconnectClients = {
    postgres: client.end?.bind(client),
    prisma: client.$disconnect?.bind(client),
  };

  const disconnect = disconnectClients[repoInput];

  const createRepositories = {
    postgres: createPostgresRepositories,
    prisma: createPrismaRepositories,
    firebase: createFirestoreRepositories,
  };
  const repositories = createRepositories[repoInput](client);

  const services = createService(repositories);

  const controller = createController(services);
  await commands.reduce(async (initial, command) => {
    await initial;
    switch (command.name) {
      case "create_hotel": {
        await controller.createHotel(command);

        break;
      }

      case "book": {
        await controller.book(command);

        break;
      }

      case "book_by_floor": {
        await controller.bookByFloor(command);

        break;
      }

      case "checkout": {
        await controller.checkout(command);

        break;
      }

      case "checkout_guest_by_floor": {
        await controller.checkoutGuestByFloor(command);

        break;
      }

      case "list_available_rooms": {
        await controller.listAvailableRooms(command);

        break;
      }

      case "list_guest": {
        await controller.listGuests(command);

        break;
      }

      case "list_guest_by_age": {
        await controller.listGuestsByAge(command);

        break;
      }

      case "list_guest_by_floor": {
        await controller.listGuestsByFloor(command);
        break;
      }

      case "get_guest_in_room": {
        await controller.getGuestsInRoom(command);
        break;
      }

      default: {
        console.log("Invalid Command");
        break;
      }
    }
    return Promise.resolve();
  }, Promise.resolve());
  await disconnect?.();
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

main();
