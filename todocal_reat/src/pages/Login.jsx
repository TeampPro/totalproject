import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // ✅ Kakao SDK 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    script.onload = () => {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init('ea5df118a470f99f77bbff428c5d972e');
      }
    };
    document.body.appendChild(script);
  }, []);

  // ✅ 일반 로그인
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || '로그인 성공');

        localStorage.setItem(
          'user',
          JSON.stringify({ id: data.id, userType: data.userType || 'member' })
        );

        // 로컬에 사용자 정보 저장 (id, userType)
        localStorage.setItem('user', JSON.stringify({ id: data.id, userType: data.userType || 'member' }));
        localStorage.setItem('memberName', data.id);

        navigate('/main');
      } else {
        alert(data.message || '로그인 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };

  // ✅ 비회원 회원가입
  const handleGuestSignup = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/belogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}\n\n아이디: ${data.id}\n비밀번호: ${data.password}`);
        localStorage.setItem('guestInfo', JSON.stringify({ id: data.id, password: data.password }));
        localStorage.setItem('user', JSON.stringify({ id: data.id, userType: data.userType || 'guest' }));

        localStorage.setItem('memberName', data.id);

        navigate('/main');
      } else {
        alert(data.message || '비회원 회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };

  // ✅ 카카오 로그인
  const handleKakaoLogin = () => {
    window.location.href = "https://kauth.kakao.com/oauth/authorize?client_id=ea5df118a470f99f77bbff428c5d972e&redirect_uri=http://localhost:8080/api/kakao/callback&response_type=code";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>로그인</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디"
            style={styles.input}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            style={styles.input}
          />
          <button type="submit" style={styles.loginButton}>로그인</button>
        </form>

        <p style={styles.footerText}>
          계정이 없으신가요?{' '}
          <span style={styles.link} onClick={() => navigate('/signup')}>
            회원가입
          </span>
        </p>

        <div style={styles.bottomButtons}>
          <button onClick={handleGuestSignup} style={styles.subButton}>
            비회원 회원가입
          </button>

          {/* ✅ 카카오 버튼 */}
          <button
            onClick={handleKakaoLogin}
            style={{ ...styles.subButton, ...styles.kakaoButton }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#FDD835')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FEE500')}
          >
            <img
              src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
              alt="Kakao Logo"
              style={styles.kakaoLogo}
            />
            카카오로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', background: '#ffffff',
  },
  card: {
    background: '#fff', padding: '40px', borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '350px', textAlign: 'center',
  },
  title: { marginBottom: '30px', color: '#333' },
  form: { display: 'flex', flexDirection: 'column' },
  input: {
    padding: '12px 15px', marginBottom: '15px',
    borderRadius: '8px', border: '1px solid #ccc',
  },
  loginButton: {
    padding: '12px', backgroundColor: '#28a745',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', marginBottom: '15px',
  },
  footerText: { marginTop: '10px', color: '#666' },
  link: { color: '#2575fc', cursor: 'pointer', fontWeight: 'bold' },
  bottomButtons: {
    display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '25px',
  },
  subButton: {
    padding: '12px', backgroundColor: '#007bff',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease',
  },
  kakaoButton: {
    backgroundColor: '#FEE500', color: '#3C1E1E',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
  },
  kakaoLogo: { width: '22px', height: '22px', objectFit: 'contain' },
};

export default Login;
