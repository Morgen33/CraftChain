import pool from '@/lib/db';
import Link from 'next/link';

async function getSellerProducts(userId: string) {
  const result = await pool.query(
    'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function getSellerOrders(userId: string) {
  const result = await pool.query(
    `SELECT o.*, p.title, u.first_name, u.last_name
     FROM orders o
     JOIN products p ON o.product_id = p.id
     JOIN users u ON o.buyer_id = u.id
     WHERE o.seller_id = $1
     ORDER BY o.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export default async function SellerDashboard() {
  const userId = 'user-id-from-session';
  
  const [products, orders] = await Promise.all([
    getSellerProducts(userId),
    getSellerOrders(userId),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <Link
          href="/products/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          List New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">My Products</h2>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded p-4">
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-gray-600">${parseFloat(product.price_usd).toFixed(2)}</p>
                <p className="text-sm text-gray-500">Status: {product.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Orders</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded p-4">
                <h3 className="font-semibold">{order.title}</h3>
                <p className="text-gray-600">
                  Buyer: {order.first_name} {order.last_name}
                </p>
                <p className="text-sm">Status: {order.order_status}</p>
                {order.tracking_number && (
                  <p className="text-sm text-blue-600">
                    Tracking: {order.tracking_number}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

