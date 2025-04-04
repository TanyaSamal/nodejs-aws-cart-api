import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { OrderService } from '../order';
import { CartService } from './services';
import { CreateOrderDto, PutCartPayload } from 'src/order/type';
import { CartItem } from '../entities/CartItem.entity';
import { Order } from 'src/entities/Order.entity';
import { CartStatus } from 'src/entities/Cart.entity';
import { DataSource } from 'typeorm';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private readonly dataSource: DataSource,
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<CartItem[]> {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );

    return cart.cartItems;
  }

  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItem[]> {
    // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      body,
    );

    return cart.cartItems;
  }

  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearUserCart(@Req() req: AppRequest) {
    await this.cartService.removeByUserId(getUserIdFromRequest(req));
  }

  @UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    const userId = getUserIdFromRequest(req);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await this.cartService.findByUserId(userId);

      if (!(cart && cart.cartItems.length)) {
        throw new BadRequestException('Cart is empty');
      }

      const order = await this.orderService.create(
        {
          user_id: userId,
          cart_id: cart.id,
          items: body.items.map(({ productId, count }) => ({
            productId: productId,
            count,
          })),
          address: body.address,
          total: body.total,
          payment: body.payment,
          delivery: body.delivery,
          comments: body.address.comment,
        },
        queryRunner.manager,
      );

      await this.cartService.updateCartStatusByUserId(
        userId,
        CartStatus.ORDERED,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      return {
        order,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  @UseGuards(BasicAuthGuard)
  @Get('order')
  async getOrder(): Promise<Order[]> {
    return await this.orderService.getAll();
  }
}
