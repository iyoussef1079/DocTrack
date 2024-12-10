import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World v2.2 (with google auth, and google drive upload file working) !!!';
  }
}
