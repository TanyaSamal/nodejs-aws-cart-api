import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PutCartPayload } from 'src/order/type';
import { Cart, CartStatus } from '../../entities/Cart.entity';
import { CartItem } from '../../entities/CartItem.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async findByUserId(userId: string): Promise<Cart> {
    const user = this.cartRepository.findOne({
      where: { user_id: userId },
      relations: ['cartItems'],
    });

    return user;
  }

  async createByUserId(user_id: string): Promise<Cart> {
    const timestamp = Date.now();

    const userCart = this.cartRepository.create({
      id: randomUUID(),
      user_id,
      created_at: timestamp,
      updated_at: timestamp,
      status: CartStatus.OPEN,
      cartItems: [],
    });

    return this.cartRepository.save(userCart);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    let userCart = await this.findByUserId(userId);

    if (!userCart) {
      userCart = await this.createByUserId(userId);
    }
    return userCart;
  }

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<Cart> {
    const userCart = await this.findOrCreateByUserId(userId);

    const index = userCart.cartItems.findIndex(
      ({ product_id }) => product_id === payload.product.id,
    );

    if (index === -1) {
      const cartItem = this.cartItemRepository.create({
        product_id: payload.product.id,
        count: payload.count,
        cart: userCart,
      });
      userCart.cartItems.push(cartItem);
      await this.cartItemRepository.save(cartItem);
    } else if (payload.count === 0) {
      await this.cartItemRepository.delete({
        cart: { id: userCart.id },
        product_id: payload.product.id,
      });
      userCart.cartItems.splice(index, 1);
    } else {
      userCart.cartItems[index].count = payload.count;
      await this.cartItemRepository.save(userCart.cartItems[index]);
    }

    return this.cartRepository.save(userCart);
  }

  async updateCartStatusByUserId(
    userId: string,
    status: CartStatus,
    manager?: EntityManager,
  ): Promise<void> {
    const cartRepository = manager
      ? manager.getRepository(Cart)
      : this.cartRepository;
    const userCart = await cartRepository.findOneBy({ user_id: userId });

    if (!userCart) {
      throw new Error('Cart not found');
    }

    userCart.status = status;
    userCart.updated_at = new Date(Date.now());

    await this.cartRepository.save(userCart);
  }

  async removeByUserId(userId): Promise<void> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      await this.cartRepository.delete(userCart.id);
    }
  }
}
