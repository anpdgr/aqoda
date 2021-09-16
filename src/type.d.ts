import * as core from "express-serve-static-core";
import { Services } from "./services";

declare module "express-serve-static-core" {
  export interface Request {
    services: Services;
  }
}

