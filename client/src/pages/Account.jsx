import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import * as userService from '../services/user.service';
import * as authService from '../services/auth.service';
import * as followService from '../services/follow.service';
import { fadeUp, pageTransition } from '../utils/animations';
import styles from './Account.module.css';

const API = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');
const TABS = ['Profile', 'My Library', 'Security', 'Preferences'];

export default function Account() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useNotification();

  const [activeTab, setActiveTab] = useState('Profile');
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const [notifReviews, setNotifReviews] = useState(() => localStorage.getItem('bookhouse_notif_reviews') !== 'false');
  const [notifOrders, setNotifOrders] = useState(() => localStorage.getItem('bookhouse_notif_orders') !== 'false');
  const [notifNews, setNotifNews] = useState(() => localStorage.getItem('bookhouse_notif_news') !== 'false');
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.avatar || null);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    userService.getLibrary()
      .then((data) => setLibrary(data.books || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    followService.getFollowStats(user._id)
      .then((stats) => { setFollowers(stats.followers || 0); setFollowing(stats.following || 0); })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    setEmailChanged(email !== user?.email);
  }, [email, user?.email]);

  useEffect(() => {
    localStorage.setItem('bookhouse_notif_reviews', notifReviews);
  }, [notifReviews]);
  useEffect(() => {
    localStorage.setItem('bookhouse_notif_orders', notifOrders);
  }, [notifOrders]);
  useEffect(() => {
    localStorage.setItem('bookhouse_notif_news', notifNews);
  }, [notifNews]);

  const img = (c) => c ? (c.startsWith('http') ? c : `${API}/${c.replace(/\\/g, '/')}`) : '';

  if (!user) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      error('Please select a JPEG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      error('Image must be under 2 MB.');
      return;
    }

    const preview = URL.createObjectURL(file);
    setAvatarUrl(preview);
    setAvatarUploading(true);

    try {
      const data = await authService.uploadAvatar(file);
      updateUser(data.user);
      setAvatarUrl(data.user.avatar);
      success('Avatar updated successfully');
    } catch (err) {
      setAvatarUrl(user.avatar || null);
      error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const updates = { name };
    if (emailChanged) {
      if (!emailPassword) {
        error('Please enter your password to change email.');
        return;
      }
      updates.email = email;
      updates.currentPassword = emailPassword;
    }
    setSaving(true);
    try {
      const data = await authService.updateProfile(updates);
      updateUser(data.user);
      setEmailPassword('');
      success('Profile updated successfully');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user.name) { error('Type your name to confirm'); return; }
    setDeleting(true);
    try {
      await authService.deleteAccount();
      logout();
      success('Account deleted');
      navigate('/');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete account');
    } finally { setDeleting(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      error('Password must be at least 8 characters');
      return;
    }
    setChangingPw(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const renderProfile = () => (
    <form onSubmit={handleProfileSave} className={styles.form}>
      <div className={styles.avatarSection}>
        <button type="button" className={styles.avatarWrap} onClick={handleAvatarClick} disabled={avatarUploading}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {name.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className={styles.avatarOverlay}>
            {avatarUploading ? (
              <span className={styles.avatarSpinner} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
            className={styles.fileInput}
          />
        </button>
        <div>
          <p className={styles.avatarName}>{user.name}</p>
          <p className={styles.avatarHint}>Click to change photo</p>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>Full Name</label>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Role</label>
          <input className={styles.input} value={user.role} disabled />
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <div className={styles.inputGroup}>
            <input
              className={`${styles.input} ${emailChanged ? styles.inputChanged : ''}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailChanged && (
              <span className={styles.changedBadge}>edited</span>
            )}
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Member Since</label>
          <input className={styles.input} value={new Date(user.createdAt).toLocaleDateString()} disabled />
        </div>
      </div>

      {emailChanged && (
        <div className={styles.field}>
          <label className={styles.label}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 6 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Confirm Password to Change Email
          </label>
          <input
            className={styles.input}
            type="password"
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
            placeholder="Enter your current password"
            required
            minLength={8}
          />
        </div>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? (
            <><span className={styles.btnSpinner} /> Saving...</>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );

  const renderLibrary = () => (
    <section>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>My Library</h3>
        <span className={styles.count}>{library.length} books</span>
      </div>
      {loading ? (
        <div className={styles.loadingWrap}><span className={styles.spinner} /> Loading...</div>
      ) : library.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <p className={styles.emptyText}>No books purchased yet.</p>
          <p className={styles.emptyHint}>Browse the library to find your next read.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {library.map((book) => (
            <div key={book._id} className={styles.bookCard}>
              {book.coverImage && (
                <div className={styles.bookCoverWrap}>
                  <img src={img(book.coverImage)} alt={book.title} className={styles.bookCover} />
                </div>
              )}
              <div className={styles.bookInfo}>
                <h4 className={styles.bookTitle}>{book.title}</h4>
                <p className={styles.bookAuthor}>{book.authorName}</p>
                {book.genre && <span className={styles.genre}>{book.genre}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  const renderSecurity = () => (
    <form onSubmit={handlePasswordChange} className={styles.form}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Change Password</h3>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Current Password</label>
        <input className={styles.input} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required minLength={8} />
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label}>New Password</label>
          <input className={styles.input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} placeholder="At least 8 characters" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Confirm New Password</label>
          <input className={styles.input} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
        </div>
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={styles.saveBtn} disabled={changingPw}>
          {changingPw ? (
            <><span className={styles.btnSpinner} /> Changing...</>
          ) : (
            'Change Password'
          )}
        </button>
      </div>
    </form>
  );

  const renderPreferences = () => (
    <div className={styles.prefs}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Preferences</h3>
      </div>
      <div className={styles.prefItem}>
        <div className={styles.prefInfo}>
          <p className={styles.prefTitle}>Dark Mode</p>
          <p className={styles.prefDesc}>Switch between light and dark theme</p>
        </div>
        <button
          className={`${styles.toggle} ${theme === 'dark' ? styles.toggleActive : ''}`}
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>
      <div className={styles.prefItem}>
        <div className={styles.prefInfo}>
          <p className={styles.prefTitle}>Review Notifications</p>
          <p className={styles.prefDesc}>Get notified when someone reviews your books</p>
        </div>
        <button
          className={`${styles.toggle} ${notifReviews ? styles.toggleActive : ''}`}
          onClick={() => setNotifReviews((v) => !v)}
          aria-label="Toggle review notifications"
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>
      <div className={styles.prefItem}>
        <div className={styles.prefInfo}>
          <p className={styles.prefTitle}>Order Updates</p>
          <p className={styles.prefDesc}>Receive updates about your orders</p>
        </div>
        <button
          className={`${styles.toggle} ${notifOrders ? styles.toggleActive : ''}`}
          onClick={() => setNotifOrders((v) => !v)}
          aria-label="Toggle order notifications"
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>
      <div className={styles.prefItem}>
        <div className={styles.prefInfo}>
          <p className={styles.prefTitle}>Newsletter</p>
          <p className={styles.prefDesc}>Stay informed about new books and promotions</p>
        </div>
        <button
          className={`${styles.toggle} ${notifNews ? styles.toggleActive : ''}`}
          onClick={() => setNotifNews((v) => !v)}
          aria-label="Toggle newsletter"
        >
          <span className={styles.toggleKnob} />
        </button>
      </div>
      <div className={styles.dangerZone}>
        <h3 className={styles.dangerTitle}>Danger Zone</h3>
        <p className={styles.prefDesc}>Once you delete your account, there is no going back.</p>
        <div className={styles.deleteRow}>
          <input className={styles.deleteInput} type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={`Type "${user?.name}" to confirm`} />
          <button className={styles.deleteBtn} onClick={handleDeleteAccount} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );

  const tabContent = {
    Profile: renderProfile,
    'My Library': renderLibrary,
    Security: renderSecurity,
    Preferences: renderPreferences,
  };

  return (
    <>
      <Header />
      <motion.main className={styles.main} variants={pageTransition} initial="initial" animate="animate" exit="exit">
        <motion.div className={styles.banner} variants={fadeUp}>
          <div className={styles.bannerInner}>
            {user.avatar ? (
              <img src={user.avatar} alt="" className={styles.bannerAvatar} />
            ) : (
              <div className={styles.bannerAvatarPlaceholder}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className={styles.bannerInfo}>
              <h1 className={styles.bannerName}>{user.name}</h1>
              <p className={styles.bannerEmail}>{user.email}</p>
              <span className={styles.bannerRole}>{user.role}</span>
            </div>
          </div>
          <div className={styles.bannerStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{library.length}</span>
              <span className={styles.statLabel}>Books</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>0</span>
              <span className={styles.statLabel}>Reviews</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{following}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{followers}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
          </div>
        </motion.div>

        <motion.div className={styles.tabs} variants={fadeUp}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            className={styles.content}
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tabContent[activeTab]()}
          </motion.div>
        </AnimatePresence>
      </motion.main>
      <Footer />
    </>
  );
}
