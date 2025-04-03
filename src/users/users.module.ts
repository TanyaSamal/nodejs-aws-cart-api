import { Module } from '@nestjs/common';
import { UsersService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { Cart } from 'src/entities/Cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Cart])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
