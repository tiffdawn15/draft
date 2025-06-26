import { HttpStatus } from "@nestjs/common";

export interface ResponseObject<T> {
    status: HttpStatus;
    message: string;
    data?: T; 
    error?: any; 
  }