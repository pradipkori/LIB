import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useStore } from '../store';
import Scene from './Scene';
import { LogOut, Library, User, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentView() {
  const { currentUser, logout, issues, books, issueBook } = useStore(state => state);
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleIssue = () => {
    if (selectedBook && currentUser) {
      issueBook(selectedBook.id, currentUser.id);
      setSelectedBook(null);
    }
  };

  const myIssues = issues.filter(i => i.studentId === currentUser?.id);

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 2.5, 6], fov: 45 }}>
        <Scene onBookSelect={setSelectedBook} />
      </Canvas>

      {/* 2D Overlay UI */}
      <div className="library-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Library color="var(--accent-primary)" size={32} />
          <h2 style={{ margin: 0, fontSize: '1.7rem', letterSpacing: '-0.02em', fontWeight: 700 }}>LIBRARY</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Retractable Sidebar */}
      <div className={`overlay-sidebar ${!isSidebarOpen ? 'hidden' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <User size={28} color="var(--success)"/>
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '1.2rem', color: '#fff' }}>{currentUser?.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Student Profile</div>
          </div>
        </div>

        <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>MY ISSUED BOOKS</h3>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
          {myIssues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <Library size={40} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1.1rem', color: '#fff' }}>No books issued yet.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.5' }}>Explore the 3D library and click on a book to issue it.</p>
            </div>
          ) : (
            myIssues.map(issue => {
              const book = books.find(b => b.id === issue.bookId);
              return (
                <div key={issue.id} className="card" style={{ padding: '1.25rem', backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.25rem', color: '#fff' }}>{book?.title}</div>
                  <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>By {book?.author}</div>
                  <span className={`status-badge ${issue.status === 'issued' ? 'status-issued' : 'status-returned'}`} style={{ padding: '0.3rem 0.8rem' }}>
                    {issue.status}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff' }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </div>

      {/* Modal for Book Selection */}
      {selectedBook && (
        <div className="modal-backdrop" onClick={() => setSelectedBook(null)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', textAlign: 'center', padding: '3rem 2rem', backgroundColor: '#1e293b', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ 
              width: '90px', height: '135px', 
              backgroundColor: selectedBook.color, 
              margin: '0 auto 2rem', 
              borderRadius: '4px 8px 8px 4px',
              boxShadow: 'inset -4px 0 10px rgba(0,0,0,0.3), 8px 8px 15px rgba(0,0,0,0.6)',
              borderLeft: '4px solid rgba(255,255,255,0.3)'
            }}></div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.8rem', color: '#f8fafc' }}>{selectedBook.title}</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem' }}>By {selectedBook.author}</p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem', fontSize: '1.05rem', backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={() => setSelectedBook(null)}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '1rem', fontSize: '1.05rem' }}
                onClick={handleIssue}
                disabled={issues.some(i => i.bookId === selectedBook.id && i.status === 'issued')}
              >
                {issues.some(i => i.bookId === selectedBook.id && i.status === 'issued') ? 'Already Issued' : 'Issue Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
