import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [kakaoId, setKakaoId] = useState('');
  const [kakaoEmail, setKakaoEmail] = useState('');
  const [useKakaoId, setUseKakaoId] = useState(false);
  const [useKakaoEmail, setUseKakaoEmail] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id || !password || !email || !name) {
      alert('모든 기본 정보를 입력해주세요.');
      return;
    }
    if (!useKakaoId && !useKakaoEmail) {
      alert('카카오 ID 또는 카카오 Email 중 하나를 선택해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          password,
          email,
          name,
          kakaoId: useKakaoId ? kakaoId : null,
          kakaoEmail: useKakaoEmail ? kakaoEmail : null,
        }),
      });

      const data = await response.text();
      if (response.ok) {
        alert(data);
        navigate('/');
      } else {
        alert(data);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>회원가입</h2>
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
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            style={styles.input}
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            style={styles.input}
          />

          <div style={{ marginBottom: '10px', textAlign: 'left' }}>
            <label>
              <input
                type="checkbox"
                checked={useKakaoId}
                onChange={(e) => setUseKakaoId(e.target.checked)}
              />{' '}
              카카오 ID 사용
            </label>
            {useKakaoId && (
              <input
                type="text"
                value={kakaoId}
                onChange={(e) => setKakaoId(e.target.value)}
                placeholder="카카오 ID 입력"
                style={styles.input}
              />
            )}
            <label>
              <input
                type="checkbox"
                checked={useKakaoEmail}
                onChange={(e) => setUseKakaoEmail(e.target.checked)}
              />{' '}
              카카오 이메일 사용
            </label>
            {useKakaoEmail && (
              <input
                type="email"
                value={kakaoEmail}
                onChange={(e) => setKakaoEmail(e.target.value)}
                placeholder="카카오 이메일 입력"
                style={styles.input}
              />
            )}
          </div>

          <button type="submit" style={styles.signupButton}>
            회원가입
          </button>
        </form>
        <p style={styles.footerText}>
          이미 계정이 있으신가요?{' '}
          <span style={styles.link} onClick={() => navigate('/')}>
            로그인
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  card: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '350px', textAlign: 'center' },
  title: { marginBottom: '30px', color: '#333' },
  form: { display: 'flex', flexDirection: 'column' },
  input: { padding: '12px 15px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc' },
  signupButton: { padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  footerText: { marginTop: '20px', color: '#666' },
  link: { color: '#2575fc', cursor: 'pointer', fontWeight: 'bold' },
};

export default SignUp;
