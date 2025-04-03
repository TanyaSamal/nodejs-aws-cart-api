import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/User.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findByName(name: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { name },
    });
  }

  async createOne({ name, email, password }: Partial<User>): Promise<User> {
    const id = randomUUID();

    const newUser = this.userRepository.create({ id, name, email, password });

    return this.userRepository.save(newUser);
  }
}
