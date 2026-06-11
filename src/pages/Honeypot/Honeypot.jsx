import { useEffect } from 'react';
import useCmsStore from '../../store/cmsStore';

const Honeypot = () => {
  const { cms } = useCmsStore();

  useEffect(() => {
    if (cms?.settings?.honeypotEnabled) {
      // API'ye ping atarak IP'yi kaydettir ve banla
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.geidostudio.com';
      fetch(`${apiUrl}/api/honeypot`, { method: 'POST' }).catch(() => {});
    }
  }, [cms]);

  // Eğer honeypot kapalıysa, sayfa içeriği gözükmez
  if (!cms?.settings?.honeypotEnabled) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f1f1' }}>
        <h1 style={{ fontFamily: 'sans-serif', color: '#444' }}>404 Not Found</h1>
      </div>
    );
  }

  // Sahte WP Admin Paneli
  return (
    <div style={{
      backgroundColor: '#f1f1f1',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif'
    }}>
      <div style={{ width: '320px', padding: '8% 0 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="https://s.w.org/style/images/about/WordPress-logotype-standard.png" alt="WordPress" style={{ width: '84px', opacity: 0.8 }} />
        </div>
        <div style={{
          backgroundColor: '#fff',
          padding: '26px 24px 46px',
          boxShadow: '0 1px 3px rgba(0,0,0,.13)',
          border: '1px solid #ccd0d4'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#2c3338' }}>Username or Email Address</label>
            <input type="text" style={{
              width: '100%',
              padding: '4px 8px',
              fontSize: '24px',
              border: '1px solid #8c8f94',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#2c3338' }}>Password</label>
            <input type="password" style={{
              width: '100%',
              padding: '4px 8px',
              fontSize: '24px',
              border: '1px solid #8c8f94',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', color: '#2c3338' }}>
              <input type="checkbox" style={{ marginRight: '8px' }} />
              Remember Me
            </label>
            <button style={{
              backgroundColor: '#2271b1',
              color: '#fff',
              border: 'none',
              padding: '4px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              borderRadius: '3px',
              lineHeight: '2.15384615'
            }}>Log In</button>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '24px' }}>
          <a href="#" style={{ color: '#2271b1', textDecoration: 'none' }}>Lost your password?</a>
        </p>
        <p style={{ textAlign: 'center', fontSize: '13px' }}>
          <a href="#" style={{ color: '#2271b1', textDecoration: 'none' }}>&larr; Back to Site</a>
        </p>
      </div>
    </div>
  );
};

export default Honeypot;
