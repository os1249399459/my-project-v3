/** Domain types. One file per aggregate; no type lives in a .vue file. */

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'refunded'

export interface Order {
  id: string
  customer: string
  amount: string
  status: OrderStatus
  createdAt: string
}

export interface Paged<T> {
  items: T[]
  total: number
  page: number
  size: number
}
