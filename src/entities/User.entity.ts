import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Cart } from './Cart.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @OneToMany(() => Cart, (cartItem) => cartItem.user_id, { cascade: true })
  carts: Cart[];
}
