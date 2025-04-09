import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cart } from './Cart.entity';
import { OrderStatus } from 'src/order/type';
import { User } from './User.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  user_id: string;

  @Column({ type: 'uuid', nullable: false })
  cart_id: string;

  @Column({ type: 'json' })
  payment: Record<string, any>;

  @Column({ type: 'json' })
  delivery: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Open })
  status: OrderStatus;

  @Column({ type: 'numeric' })
  total: number;

  @ManyToOne(() => Cart, (cart) => cart.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
