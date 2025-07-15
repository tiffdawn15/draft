import { HttpStatus } from '@nestjs/common';
import { Pagination } from '../artworks/artworks.service';

export interface ResponseObject<T> {
  status: HttpStatus;
  pagination: Pagination;
  message: string;
  data?: T;
  error?: string;
}
