import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import * as orderService from '../services/order.service';
import styles from './Orders.module.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then((data) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>My Orders</h1>
        {loading ? (
          <p className={styles.muted}>Loading...</p>
        ) : orders.length === 0 ? (
          <div className={styles.empty}><p>No orders yet.</p></div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <div key={order._id} className={styles.order}>
                <div className={styles.head}>
                  <span className={styles.date}>{formatDate(order.createdAt)}</span>
                  <span className={`${styles.status} ${order.status === 'delivered' ? styles.delivered : order.status === 'shipped' ? styles.shipped : ''}`}>{order.status}</span>
                  <span className={styles.total}>${Number(order.totalPrice).toFixed(2)}</span>
                </div>
                <div className={styles.books}>
                  {order.books.map((item) => (
                    <div key={item.book?._id || item._id} className={styles.bookItem}>
                      <span className={styles.bookTitle}>{item.book?.title || 'Unknown'}</span>
                      <span className={styles.bookPrice}>${Number(item.priceAtPurchase).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {order.appliedCoupon && <p className={styles.coupon}>Coupon: {order.appliedCoupon} (-${Number(order.discountAmount || 0).toFixed(2)})</p>}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
