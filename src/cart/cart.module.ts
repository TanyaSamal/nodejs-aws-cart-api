import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { CartController } from './cart.controller';
import { CartService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/entities/Cart.entity';
import { CartItem } from 'src/entities/CartItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), OrderModule],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
