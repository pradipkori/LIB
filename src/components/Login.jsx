import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { LibraryBig, ShieldCheck, UserCircle, ChevronRight, Sparkles } from 'lucide-react';

export default function Login() {
  const users = useStore(state => state.users);
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (userId) => {
    login(userId);
    const user = users.find(u => u.id === userId);
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/library');
    }
  };

  return (
    <div className="modern-login-container">
      {/* Dynamic Background Elements */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>
      
      <div className="glass-login-card">
        <div className="login-header">
          <div className="logo-icon-wrapper">
            <LibraryBig size={48} color="var(--accent-primary)" />
            <div className="sparkle-icon">
              <Sparkles size={16} color="#60a5fa" />
            </div>
          </div>
          <h1 className="login-title">
            Library<span>OS</span>
          </h1>
          <p className="login-subtitle">
            Welcome to the next generation of library management. Select your profile to continue.
          </p>
        </div>

        <div className="profile-selection">
          {users.map(user => (
            <button 
              key={user.id} 
              className={`modern-profile-btn ${user.role}`}
              onClick={() => handleLogin(user.id)}
            >
              <div className="profile-icon">
                {user.role === 'admin' ? (
                  <ShieldCheck size={28} />
                ) : (
                  <UserCircle size={28} />
                )}
              </div>
              
              <div className="profile-info">
                <div className="profile-name">{user.name}</div>
                <div className="profile-role">{user.role} Access</div>
              </div>

              <div className="action-icon">
                <ChevronRight size={20} />
              </div>
            </button>
          ))}
        </div>
        
        <div className="login-footer">
          <p>Secure connection established</p>
        </div>
      </div>
    </div>
  );
}
