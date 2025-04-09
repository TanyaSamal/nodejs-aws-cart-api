import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateOrderPayload, OrderStatus } from '../type';
import { Order } from 'src/entities/Order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getAll(): Promise<Order[]> {
    return await this.orderRepository.find();
  }

  async findById(orderId: string): Promise<Order> {
    return await this.orderRepository.findOneBy({ id: orderId });
  }

  async create(
    data: CreateOrderPayload,
    manager?: EntityManager,
  ): Promise<Order> {
    const orderRepository = manager
      ? manager.getRepository(Order)
      : this.orderRepository;
    const id = randomUUID() as string;
    const order: Order = await orderRepository.create({
      id,
      ...data,
      status: OrderStatus.Open,
    });

    return await this.orderRepository.save(order);
  }

  async update(orderId: string, data: Partial<Order>): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id: orderId });

    if (!order) {
      throw new Error('Order does not exist.');
    }

    Object.assign(order, data);

    return await this.orderRepository.save(order);
  }
}
