import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../services/api';
import styles from './Admin.module.css';

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'reports', label: 'Reports' },
  { id: 'orders', label: 'Orders' },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  return (
    <>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <nav className={styles.tabs}>
          {TABS.map((tab) => (
            <button key={tab.id} className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
          ))}
        </nav>
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'coupons' && <CouponsTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'orders' && <OrdersTab />}
      </main>
      <Footer />
    </>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = () => { api.get('/users').then(({ data }) => setUsers(data.data.users || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { refresh(); }, []);
  const deactivate = async (id) => { try { await api.delete(`/users/${id}`); refresh(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };
  if (loading) return <p className={styles.loading}>Loading...</p>;
  return (
    <section>
      <h2 className={styles.sectionTitle}>All Users</h2>
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td><td>{user.email}</td>
                <td><span className={styles.badge}>{user.role}</span></td>
                <td>{user.isActive ? <span className={styles.active}>Active</span> : <span className={styles.inactive}>Inactive</span>}</td>
                <td>{user.isActive && user.role !== 'admin' && <button className={styles.danger} onClick={() => deactivate(user._id)}>Deactivate</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(''); const [discountPercent, setDiscountPercent] = useState(''); const [expiresAt, setExpiresAt] = useState('');
  const refresh = () => { setLoading(true); api.get('/coupons').then(({ data }) => setCoupons(data.data.coupons || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/set-state-in-effect
  const handleCreate = async (e) => { e.preventDefault(); try { await api.post('/coupons', { code, discountPercent: Number(discountPercent), expiresAt }); setCode(''); setDiscountPercent(''); setExpiresAt(''); refresh(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };
  const handleDelete = async (id) => { try { await api.delete(`/coupons/${id}`); refresh(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };
  return (
    <section>
      <h2 className={styles.sectionTitle}>Manage Coupons</h2>
      <form className={styles.form} onSubmit={handleCreate}>
        <input type="text" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <input type="number" placeholder="Discount %" min="1" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} required />
        <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} required />
        <button type="submit">Create</button>
      </form>
      {loading ? <p className={styles.loading}>Loading...</p> : (
        <div className={styles.wrapper}>
          <table className={styles.table}>
            <thead><tr><th>Code</th><th>Discount</th><th>Expires</th><th>Used</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td className={styles.code}>{c.code}</td><td>{c.discountPercent}%</td>
                  <td>{new Date(c.expiresAt).toLocaleDateString()}</td>
                  <td>{c.usedCount}/{c.usageLimit}</td>
                  <td>{c.isActive ? <span className={styles.active}>Yes</span> : <span className={styles.inactive}>No</span>}</td>
                  <td><button className={styles.danger} onClick={() => handleDelete(c._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = () => { api.get('/reports').then(({ data }) => setReports(data.data.reports || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { refresh(); }, []);
  const updateStatus = async (id, status) => { try { await api.put(`/reports/${id}`, { status, adminNotes: 'Reviewed' }); refresh(); } catch (err) { alert(err.response?.data?.message || 'Failed'); } };
  if (loading) return <p className={styles.loading}>Loading...</p>;
  return (
    <section>
      <h2 className={styles.sectionTitle}>Reports</h2>
      {reports.length === 0 ? <p className={styles.empty}>No reports.</p> : (
        <div className={styles.wrapper}>
          <table className={styles.table}>
            <thead><tr><th>Type</th><th>Reason</th><th>By</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td><span className={styles.badge}>{r.type}</span></td>
                  <td>{r.reason}</td>
                  <td>{r.reportedBy?.name || 'Unknown'}</td>
                  <td><span className={`${styles.statusBadge} ${r.status === 'pending' ? styles.pending : r.status === 'reviewed' ? styles.reviewed : styles.dismissed}`}>{r.status}</span></td>
                  <td>{r.status === 'pending' && <><button className={styles.actionBtn} onClick={() => updateStatus(r._id, 'reviewed')}>Review</button><button className={styles.danger} onClick={() => updateStatus(r._id, 'dismissed')}>Dismiss</button></>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/orders').then(({ data }) => setOrders(data.data.orders || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <p className={styles.loading}>Loading...</p>;
  return (
    <section>
      <h2 className={styles.sectionTitle}>All Orders</h2>
      {orders.length === 0 ? <p className={styles.empty}>No orders.</p> : (
        <div className={styles.wrapper}>
          <table className={styles.table}>
            <thead><tr><th>User</th><th>Books</th><th>Total</th><th>Coupon</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o.userId?.name || 'Unknown'}</td>
                  <td>{o.books?.length || 0}</td>
                  <td className={styles.price}>${Number(o.totalPrice).toFixed(2)}</td>
                  <td>{o.appliedCoupon || <span className={styles.muted}>&mdash;</span>}</td>
                  <td><span className={`${styles.statusBadge} ${styles.pending}`}>{o.status}</span></td>
                  <td className={styles.date}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
