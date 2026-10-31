"use client"

import { useAdminOrders } from "./use-admin-orders"
import { AdminOrdersView } from "./orders-view"

export default function AdminOrdersPage() {
  const ctrl = useAdminOrders()
  return <AdminOrdersView controller={ctrl} />
}
