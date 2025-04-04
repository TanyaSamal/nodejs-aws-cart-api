export enum OrderStatus {
  Open = 'OPEN',
  Approved = 'APPROVED',
  Confirmed = 'CONFIRMED',
  Sent = 'SENT',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

export type Address = {
  address: string;
  firstName: string;
  lastName: string;
  comment: string;
};

export type CreateOrderDto = {
  items: Array<{ productId: string; count: 1 }>;
  address: Address;
  total: number;
  payment: Payment;
  delivery: Delivery;
};

export type PutCartPayload = {
  product: { description: string; id: string; title: string; price: number };
  count: number;
};

export type CreateOrderPayload = {
  user_id: string;
  cart_id: string;
  items: Array<{ productId: string; count: number }>;
  address: Address;
  total: number;
  payment: Payment;
  delivery: Delivery;
  comments?: string;
};

export type Payment = {
  method: string;
  details?: string;
};

export type Delivery = {
  address: string;
  city: string;
  country: string;
};
