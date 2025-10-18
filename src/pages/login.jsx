import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserByEmail } from '../db/dbService';
import logo from '../assets/elryanLogo.png'
import setUser from '../Utils/LoadUser'
import getUser from '../Utils/getUser'
import { LogIn, Mail, Lock } from 'lucide-react'
import { BubbleBackground } from '@/components/animate-ui/components/backgrounds/bubble';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [u1,setu1]=useState();
  const navigate = useNavigate();
  
const colors = {
  first:  '255,255,255',   
  second: '245,250,255',   
  third:  '190,220,255', 
   fourth:'120,170,255',  
   fifth:'100,130,255',
   sixth:'100,100,255',

}

  useEffect(() => {
    if (u1) {
      console.log(u1);
    }
  }, [u1]);
  const handleAuthClick = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const user = await getUserByEmail(email.trim());
      if (!user) {
        setMessage('user not found');
        setIsLoading(false);


        return;
      }
      if (user.password === password) {
        setMessage('Login successful!');
        setUser("currentUser",user)
        setu1(getUser("currentUser"));
        console.log(getUser("currentUser"));

        const role = user?.role;
        if (role === 'ADMIN' || role === 'SUPERVISOR') {
          navigate('/home', { replace: true });
        } else {
          navigate('/ShowInstallations', { replace: true });
        }
      } else {
        setMessage('Wrong password');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error accessing database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuthClick();
    }
  };

  return (
    <>
    {/* i didnt wanna to create a separeted file for the style 😁 */}
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .login-wrapper {
          width: 100%;
          max-width: 420px;
        }

        .login-card {
          background:rgba(255, 255, 255, 0.47);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 5px 5px 20px rgba(229, 229, 229, 0.38);
          padding: 40px;
          border: 1px solid rgba(252, 252, 252, 0.2);
          position: relative;
          z-index: 1;
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo-container {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .logo {
          width: 120px;
          height: auto;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .login-title {
          font-size: 36px;
          font-weight: 700;
          color: #000 ;
          margin-bottom: 8px;
        }

        .login-subtitle {
          color: #000;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          color: rgba(0, 0, 0, 0.9);
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 10px 13px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 3px solid rgba(0, 0, 0, 0.3);
          
          color: black;
          font-size: 15px;
          transition: all 0.3s ease;
          outline: none;
        }

        .input-with-icon {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(0, 0, 0, 0.85);
          pointer-events: none;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        }
        .input-with-icon .form-input {
          padding-left: 40px;
        }
        .input-icon {
          transition: transform 0.2s ease;
        }
        .input-with-icon:focus-within .input-icon {
          transform: translateY(-50%) scale(1.05);
        }

        .form-input::placeholder {
          color: rgba(74, 68, 68, 0.5);
        }

        .form-input:focus {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }

        .message-box {
          padding: 12px 16px;
          border-radius: 12px;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 20px;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-success {
          background: rgba(34, 197, 94, 0.2);
          color: #bbf7d0;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .message-error {
          background: rgba(239, 68, 68, 0.2);
          color:rgb(255, 125, 125);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .login-button {
          width: 100%;
          padding: 14px;
          background: white;
          color:rgb(1, 1, 1);
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(249, 249, 249, 0.22);
          box-shadow: 0 4px 15px rgba(24, 24, 24, 0.22);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-button svg {
          transition: transform 0.2s ease;
        }
        .login-button:hover svg {
          transform: translateX(2px);
        }

        .login-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(57, 116, 184, 0.3);
          border-top-color:rgb(67, 81, 97);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .forgot-password {
          text-align: center;
          margin-top: 24px;
        }

        

 
        

        @media (max-width: 480px) {
          .login-card {
            padding: 30px 24px;
          }

          .login-title {
            font-size: 28px;
          }

          .form-input {
            padding: 12px 14px;
            font-size: 16px;

          }

          .login-button {
            padding: 12px;
          }
        }
      `}</style>

      <div className="login-container">
        <BubbleBackground colors={colors} interactive={true} className="absolute inset-0" />
        <div className="login-wrapper">
          <div className="login-card">
            <div className="login-header">
              <div className="logo-container">
                <img src={logo} alt="Elryan Logo" className="logo" />
              </div>
              <h1 className="login-title">Welcome Back </h1>
              <p className="login-subtitle">Sign in to continue to your account</p>
            </div>

            <div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="form-input"
                  />
                </div>
              </div>

              {message && (
                <div className={`message-box ${message === 'Login successful!' ? 'message-success' : 'message-error'}`}>
                  {message}
                </div>
              )}

              <button
                onClick={handleAuthClick}
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </div>

            
          </div>

         
        </div>
      </div>
    </>
  );
};

export default Login;