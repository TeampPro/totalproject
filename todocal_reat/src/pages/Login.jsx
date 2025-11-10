import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // 🔹 일반 로그인
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
        // 정상 로그인
        alert(data.message || '로그인 성공');
        // 로컬에 사용자 정보 저장 (id, userType)
        localStorage.setItem('user', JSON.stringify({ id: data.id, userType: data.userType || 'member' }));
        navigate('/main');
      } else {
        // 서버가 400등으로 보낸 에러 메시지 처리
        alert(data.message || '로그인 실패');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };

  // 🔹 비회원 회원가입 (랜덤 ID/PW 발급)
  const handleGuestSignup = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/belogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        // 안내창에 아이디/비밀번호 표시
        alert(`✅ ${data.message}\n\n아이디: ${data.id}\n비밀번호: ${data.password}`);

        // BeLogin 페이지에서 표시하려면 guestInfo로 저장
        localStorage.setItem('guestInfo', JSON.stringify({ id: data.id, password: data.password }));
        // 전체 앱에서 사용자 타입 확인하려면 user로도 저장
        localStorage.setItem('user', JSON.stringify({ id: data.id, userType: data.userType || 'guest' }));

        navigate('/main');
      } else {
        alert(data.message || '비회원 회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결에 실패했습니다.');
    }
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
          <button type="submit" style={styles.loginButton}>
            로그인
          </button>
        </form>

        <p style={styles.footerText}>
          계정이 없으신가요?{' '}
          <span style={styles.link} onClick={() => navigate('/signup')}>
            회원가입
          </span>
        </p>

        <button onClick={handleGuestSignup} style={styles.guestButton}>
          비회원 회원가입
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#ffffff' },
  card: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '350px', textAlign: 'center' },
  title: { marginBottom: '30px', color: '#333' },
  form: { display: 'flex', flexDirection: 'column' },
  input: { padding: '12px 15px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc' },
  loginButton: { padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px' },
  guestButton: { padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  footerText: { marginTop: '20px', color: '#666' },
  link: { color: '#2575fc', cursor: 'pointer', fontWeight: 'bold' },
};

export default Login;
