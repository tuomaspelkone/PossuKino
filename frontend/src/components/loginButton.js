import React, { useState } from 'react';
import './loginButton.css';

function LoginButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3001/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Kirjautuminen onnistui!');
        // Tallenna token localStorageen
        localStorage.setItem('token', data.token);
        // Tallenna käyttäjätiedot localStorageen jotta muut komponentit voivat käyttää niitä
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        // Ilmoita muille komponenteille että käyttäjä vaihtui
        window.dispatchEvent(new Event('userChanged'));
        setTimeout(() => {
          setIsOpen(false);
          setEmail('');
          setPassword('');
        }, 1000);
      } else {
        setError(data.error || 'Kirjautuminen epäonnistui');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Virhe kirjautumisessa');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username) {
      setError('Käyttäjänimi vaaditaan rekisteröitymiseen');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Rekisteröityminen onnistui! Voit nyt kirjautua sisään.');
        setIsRegistering(false);
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        setError(data.error || 'Rekisteröityminen epäonnistui');
      }
    } catch (error) {
      console.error('Register error:', error);
      setError('Virhe rekisteröitymisessä');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  return (
    <div className="login-button-container">
      <button 
        className="login-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        👤 Kirjaudu sisään
      </button>

      {isOpen && (
        <div className="login-dropdown">
          <div className="login-header">
            <h3>{isRegistering ? 'Rekisteröidy' : 'Kirjaudu sisään'}</h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            {isRegistering && (
              <div className="form-group">
                <label>Käyttäjänimi</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Käyttäjänimi"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Sähköposti</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="esimerkki@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Salasana</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Salasana"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="submit-btn">
              {isRegistering ? 'Rekisteröidy' : 'Kirjaudu'}
            </button>
          </form>

          <div className="toggle-mode">
            <button 
              type="button" 
              onClick={toggleMode}
              className="toggle-mode-btn"
            >
              {isRegistering 
                ? 'Onko sinulla jo tili? Kirjaudu sisään' 
                : 'Eikö sinulla ole tiliä? Rekisteröidy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginButton;
