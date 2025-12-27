import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

@Injectable()
export class HashingService {
  private readonly salt = 10;

  async hash(password: string): Promise<string> {
    return await hash(password, this.salt);
  }

  async compare(password: string, passwordSavedInDb: string): Promise<boolean> {
    return await compare(password, passwordSavedInDb);
  }
}
