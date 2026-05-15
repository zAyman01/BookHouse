import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Spinner from '../components/Spinner';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import * as orderService from '../services/order.service';
import * as couponService from '../services/coupon.service';
import styles from './Cart.module.css';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const { success, error } = useNotification();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const result = await couponService.validateCoupon(couponCode);
      setDiscountPercent(result.discountPercent);
      setDiscount((subtotal * result.discountPercent) / 100);
      setCouponApplied(result.code);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
      setDiscount(0); setDiscountPercent(0); setCouponApplied('');
    }
  };

  const handlePlaceOrder = async () => {
    setPlacing(true); setOrderError('');
    try {
      const bookIds = items.map((item) => item.book._id);
      await orderService.placeOrder({ bookIds, couponCode: couponApplied || undefined });
      clearCart();
      success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order';
      setOrderError(msg);
      error(msg);
    } finally { setPlacing(false); }
  };

  const total = Math.max(0, subtotal - discount);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Shopping Cart</h1>
        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Your cart is empty.</p>
            <button className={styles.primaryBtn} onClick={() => navigate('/library')}>Browse Books</button>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.items}>
              {items.map(({ book, quantity }) => (
                <div key={book._id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <h3>{book.title}</h3>
                    <p className={styles.itemAuthor}>{book.authorName}</p>
                    <p className={styles.itemPrice}>${Number(book.price).toFixed(2)}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.qty}>
                      <button onClick={() => updateQuantity(book._id, quantity - 1)} disabled={quantity <= 1}>&minus;</button>
                      <span>{quantity}</span>
                      <button onClick={() => updateQuantity(book._id, quantity + 1)}>+</button>
                    </div>
                    <p className={styles.itemTotal}>${(book.price * quantity).toFixed(2)}</p>
                    <button className={styles.removeBtn} onClick={() => removeItem(book._id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.summary}>
              <h2>Order Summary</h2>
              <div className={styles.coupon}>
                <input type="text" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={!!couponApplied} />
                {!couponApplied ? <button onClick={handleApplyCoupon}>Apply</button> : <button onClick={() => { setCouponApplied(''); setDiscount(0); setDiscountPercent(0); setCouponCode(''); }}>Clear</button>}
                {couponError && <p className={styles.couponErr}>{couponError}</p>}
                {couponApplied && <p className={styles.couponSuccess}>Coupon applied: {couponApplied} ({discountPercent}% off)</p>}
              </div>
              <div className={styles.row}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className={styles.row}><span>Discount</span><span className={styles.discountVal}>&minus;${discount.toFixed(2)}</span></div>}
              <div className={`${styles.row} ${styles.totalRow}`}><span>Total</span><span>${total.toFixed(2)}</span></div>
              {orderError && <p className={styles.orderErr}>{orderError}</p>}
              <button className={styles.checkoutBtn} onClick={handlePlaceOrder} disabled={placing}>
                {placing ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Spinner size={16} /> Placing...</span> : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
