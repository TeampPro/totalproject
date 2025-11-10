import React, { useEffect, useState } from 'react';

function BeLogin() {
  const [guestInfo, setGuestInfo] = useState({ id: '', password: '' });

  useEffect(() => {
    const savedGuest = JSON.parse(localStorage.getItem('guestInfo'));
    if (savedGuest) {
      setGuestInfo(savedGuest);
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>비회원 로그인 완료 🎉</h2>

        {guestInfo.id ? (
          <>
            <p style={styles.info}>🆔 아이디: <b>{guestInfo.id}</b></p>
            <p style={styles.info}>🔑 비밀번호: <b>{guestInfo.password}</b></p>
            <p style={styles.warning}>
              ⚠️ 비회원 계정은 임시로 생성되며, 일부 기능이 제한됩니다.
            </p>
          </>
        ) : (
          <p style={styles.loading}>비회원 정보를 불러오는 중...</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    width: '380px',
    textAlign: 'center',
  },
  title: { color: '#333', marginBottom: '20px' },
  info: { color: '#555', fontSize: '16px', marginBottom: '10px' },
  warning: { color: '#d9534f', marginTop: '15px', fontWeight: 'bold' },
  loading: { color: '#999' },
};

export default BeLogin;
