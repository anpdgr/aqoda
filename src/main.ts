//DONE: edit import error to be able to run server.js normally
//DONE: if server.js success -> convert js to ts (client, repo)

import fs from "fs";

import createController from "./cli-controller";
import createService from "./services.js";
import createPostgresRepositories from "./postgres-repositories";
import createPrismaRepositories from "./prisma-repositories";
import createFirestoreRepositories from "./firestore-repositories";
import createPostgresClient from "./postgres-client"; // () => Client
import createPrismaClient from "./prisma-client";
import createFirestoreClient from "./firestore-client";

class Command {
  constructor(public name: string, public params: any) {}
}

// type createObjects = Partial<Record<"postgres" | "prisma" | "firebase", any>>
// {
//   [key: string]: any,
//   postgres: object,
//   prisma: object,
//   firebase?: object
// }

// type a = Record<"postgres" | "prisma" | "firebase", object>

// interface createObjects {
//   [key: string]: any,
//   postgres: any,
//   prisma: any,
//   firebase?: any
// }

type createObjects = {
  [key: string]: any,
  postgres: object,
  prisma: object,
  firebase?: object
}


async function main(): Promise<void> {
  const fileName: string = "/Users/ananyap/Documents/Calcal/aqoda/src/input.txt";
  const commands: Command[] = getCommandsFromFileName(fileName);

  const repoInput: string = process.argv[2];

  const createClients: createObjects = {
    postgres: createPostgresClient,
    prisma: createPrismaClient,
    firebase: createFirestoreClient,
  };
  const client = createClients[repoInput]();

  //DONE: create disconnect
  const disconnectClients: createObjects = {
    postgres: client.end?.bind(client),
    prisma: client.$disconnect?.bind(client),
  } as const; 
  const disconnect = disconnectClients[repoInput];

  const createRepositories: createObjects = {
    postgres: createPostgresRepositories,
    prisma: createPrismaRepositories,
    firebase: createFirestoreRepositories,
  };
  const repositories = createRepositories[repoInput](client);

  const services = createService(repositories);

  const controller = createController(services);

  await commands.reduce(async (initial: Promise<void>, command: Command) => {
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

function getCommandsFromFileName(fileName: string): Command[] {
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
