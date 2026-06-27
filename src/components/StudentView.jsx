import React, { useState } from 'react';
import { useStore } from '../store';
import { LogOut, Library, User, BookOpen, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentView() {
  const { currentUser, logout, issues, books, issueBook, returnBook } = useStore(state => state);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleIssue = (bookId) => {
    if (currentUser) {
      issueBook(bookId, currentUser.id);
    }
  };

  const myIssues = issues.filter(i => i.studentId === currentUser?.id);
  const issuedBookIds = myIssues.filter(i => i.status === 'issued').map(i => i.bookId);

  return (
    <div className="dashboard-layout student-dashboard">
      {/* Sidebar */}
      <div className="sidebar" style={{ background: 'var(--bg-surface)' }}>
        <div className="sidebar-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Library color="var(--accent-primary)" size={28} style={{ marginRight: '1rem' }}/>
          <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, letterSpacing: '-0.03em' }}>
            Library<span style={{ color: 'var(--accent-primary)' }}>OS</span>
          </h2>
        </div>
        
        <div className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
            <BookOpen size={20} /> <span style={{ fontSize: '1.05rem' }}>Browse Books</span>
          </div>
          <div className={`nav-item ${activeTab === 'my-issues' ? 'active' : ''}`} onClick={() => setActiveTab('my-issues')}>
            <Clock size={20} /> <span style={{ fontSize: '1.05rem' }}>My Issues</span>
          </div>
        </div>

        <div style={{ padding: '2rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color="#10b981"/>
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{currentUser?.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Student</div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ backgroundColor: 'var(--bg-dark)' }}>
        <div className="top-header" style={{ padding: '2rem 3rem 1rem', border: 'none', background: 'transparent' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {activeTab === 'browse' ? 'Available Books' : 'My Issued Books'}
              {activeTab === 'browse' && <Sparkles color="var(--accent-primary)" size={28} />}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
              {activeTab === 'browse' 
                ? 'Explore our collection and issue books instantly.' 
                : 'Track your currently issued books and history.'}
            </p>
          </div>
        </div>

        <div className="content-body" style={{ padding: '1rem 3rem 3rem' }}>
          {activeTab === 'browse' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {books.map(book => {
                const isIssued = issuedBookIds.includes(book.id);
                return (
                  <div key={book.id} className="book-card card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ 
                      height: '140px', 
                      background: `linear-gradient(135deg, ${book.color}cc 0%, ${book.color}40 100%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '70px', height: '100px',
                        backgroundColor: book.color,
                        borderRadius: '4px 8px 8px 4px',
                        boxShadow: '8px 8px 15px rgba(0,0,0,0.4), inset -4px 0 10px rgba(0,0,0,0.2)',
                        borderLeft: '4px solid rgba(255,255,255,0.4)'
                      }}></div>
                    </div>
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{book.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>By {book.author}</p>
                      
                      <div style={{ marginTop: 'auto' }}>
                        {isIssued ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.95rem', fontWeight: '600' }}>
                            <CheckCircle size={18} /> Currently Issued
                          </div>
                        ) : (
                          <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                            onClick={() => handleIssue(book.id)}
                          >
                            Issue Book
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'my-issues' && (
            <div>
              {myIssues.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Library size={64} style={{ margin: '0 auto 1.5rem', color: 'var(--text-muted)', opacity: 0.5 }} />
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Books Issued Yet</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Go to the Browse tab to find and issue books.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ padding: '1.5rem 2rem' }}>Book Title</th>
                        <th>Author</th>
                        <th>Issue Date</th>
                        <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myIssues.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).map(issue => {
                        const book = books.find(b => b.id === issue.bookId);
                        return (
                          <tr key={issue.id}>
                            <td style={{ padding: '1.5rem 2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '32px', height: '48px', backgroundColor: book?.color || '#333', borderRadius: '3px', boxShadow: '2px 2px 5px rgba(0,0,0,0.3)' }}></div>
                                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{book?.title || 'Unknown Book'}</span>
                              </div>
                            </td>
                            <td style={{ color: 'var(--text-muted)' }}>{book?.author || 'Unknown'}</td>
                            <td style={{ color: 'var(--text-muted)' }}>
                              {new Date(issue.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                              <span className={`status-badge ${issue.status === 'issued' ? 'status-issued' : 'status-returned'}`} style={{ padding: '0.4rem 1rem' }}>
                                {issue.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
