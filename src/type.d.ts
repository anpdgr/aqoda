import * as core from 'express-serve-static-core';
import createService from './services'

declare module "express-serve-static-core" {
  export interface Request {
    services: ReturnType<typeof createService>
  }
}