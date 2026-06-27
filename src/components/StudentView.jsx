import React, { useState, useMemo } from 'react';
import { useStore, calculateFine } from '../store';
import { LogOut, Library, User, BookOpen, Clock, CheckCircle, Sparkles, Search, RotateCcw, AlertTriangle, Award, Star, Menu } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

export default function StudentView() {
  const { currentUser, logout, issues, books, issueBook, returnBook, addToast } = useStore(state => state);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const myIssues = issues.filter(i => i.studentId === currentUser?.id);
  const activeIssues = myIssues.filter(i => i.status === 'issued');
  const issuedBookIds = activeIssues.map(i => i.bookId);

  const myReadBooks = myIssues.filter(issue => issue.status === 'returned');
  const totalRead = myReadBooks.length;
  const badges = [];
  if (totalRead >= 1) badges.push({ name: 'First Book', icon: <Star size={20} color="#f59e0b" />, color: '#f59e0b' });
  if (totalRead >= 3) badges.push({ name: 'Avid Reader', icon: <BookOpen size={20} color="#14b8a6" />, color: '#14b8a6' });
  if (totalRead >= 5) badges.push({ name: 'Bookworm', icon: <Award size={20} color="#ec4899" />, color: '#ec4899' });

  const recommendedBooks = useMemo(() => {
    if (myIssues.length === 0) return books.slice(0, 4);
    const catCounts = {};
    myIssues.forEach(issue => {
      const b = books.find(book => book.id === issue.bookId);
      if (b) catCounts[b.category] = (catCounts[b.category] || 0) + 1;
    });
    const topCategory = Object.keys(catCounts).sort((a,b) => catCounts[b] - catCounts[a])[0];
    
    const issuedIds = new Set(myIssues.map(i => i.bookId));
    const recs = books.filter(b => b.category === topCategory && !issuedIds.has(b.id));
    
    if (recs.length < 4) {
      const others = books.filter(b => !issuedIds.has(b.id) && b.category !== topCategory);
      return [...recs, ...others].slice(0, 4);
    }
    return recs.slice(0, 4);
  }, [myIssues, books]);

  const handleIssue = (bookId) => {
    if (currentUser) {
      if (activeIssues.length >= 3) {
        addToast('Issue limit reached. Please return a book first.', 'error');
        return;
      }
      issueBook(bookId, currentUser.id);
      addToast('Book issued successfully!', 'success');
    }
  };

  const handleReturn = (issueId) => {
    returnBook(issueId);
    addToast('Book returned successfully.', 'success');
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout student-dashboard">
      {/* Mobile Overlay */}
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{ background: 'var(--bg-surface)' }}>
        <div className="sidebar-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Library color="var(--accent-primary)" size={28} style={{ marginRight: '1rem' }}/>
          <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, letterSpacing: '-0.03em' }}>
            Library<span style={{ color: 'var(--accent-primary)' }}>OS</span>
          </h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}>
            <User size={20} /> My Profile
          </button>
          <button className={`nav-item ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => { setActiveTab('browse'); setIsMobileMenuOpen(false); }}>
            <Library size={20} /> Browse Books
          </button>
          <button className={`nav-item ${activeTab === 'my-issues' ? 'active' : ''}`} onClick={() => { setActiveTab('my-issues'); setIsMobileMenuOpen(false); }}>
            <BookOpen size={20} /> My Issues
          </button>
        </nav>

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
        <div className="top-header" style={{ padding: '2rem 3rem 1rem', border: 'none', background: 'transparent', height: 'auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} color="var(--text-main)" />
            </button>
            <div>
              <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {activeTab === 'profile' ? 'My Profile' : activeTab === 'browse' ? 'Available Books' : 'My Issued Books'}
                {activeTab === 'browse' && <Sparkles color="var(--accent-primary)" size={28} />}
              </h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                {activeTab === 'profile' ? 'Manage your account and view achievements.' : activeTab === 'browse' 
                  ? 'Explore our collection and issue books instantly.' 
                  : 'Track your currently issued books and history.'}
              </p>
            </div>
          </div>
        </div>

        <div className="content-body" style={{ padding: '1rem 3rem 3rem' }}>
          {activeTab === 'profile' && (
            <div className="fade-in">
              {/* Digital Library Card */}
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
                <div className="card stagger-1" style={{ 
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(20, 184, 166, 0.2))',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '2rem',
                  borderRadius: '20px',
                  width: '400px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(10px)',
                  transform: 'perspective(1000px) rotateY(5deg)',
                  transition: 'transform 0.3s ease'
                }}>
                  <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-primary)', opacity: 0.2, borderRadius: '50%', filter: 'blur(40px)' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ color: 'var(--accent-secondary)', margin: '0 0 0.5rem 0', letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase' }}>LibraryOS Member</h4>
                      <h2 style={{ margin: 0, fontSize: '1.8rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{currentUser?.name}</h2>
                      <p style={{ margin: '0.5rem 0 2rem 0', fontFamily: 'monospace', color: 'var(--text-muted)' }}>ID: {currentUser?.id}</p>
                    </div>
                    <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '10px' }}>
                      <QRCodeSVG value={`STUDENT:${currentUser?.id}`} size={70} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Issues</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{myIssues.filter(i => i.status === 'issued').length}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Books Read</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{totalRead}</div>
                    </div>
                  </div>
                </div>

                {/* Gamification Badges */}
                <div className="card stagger-2" style={{ flex: 1, minWidth: '300px', padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Award color="var(--accent-primary)" /> My Achievements
                  </h3>
                  {badges.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Read books to unlock badges!</p>
                  ) : (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {badges.map((badge, idx) => (
                        <div key={idx} style={{ 
                          display: 'flex', flexDirection: 'column', alignItems: 'center', 
                          background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: `1px solid ${badge.color}30`
                        }}>
                          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `${badge.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                            {badge.icon}
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{badge.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'browse' && (
            <div className="fade-in">
              {/* Recommendations Section */}
              {recommendedBooks.length > 0 && (
                <div style={{ marginBottom: '3rem' }} className="stagger-1">
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-secondary)' }}>
                    <Sparkles /> Recommended for You
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                    {recommendedBooks.map((book, idx) => (
                      <div key={book.id} className="card book-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--accent-secondary)50', animationDelay: `${idx * 0.1}s`, display: 'flex', flexDirection: 'column' }}>
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
                            borderLeft: '4px solid rgba(255,255,255,0.3)',
                            position: 'relative'
                          }}>
                            <div style={{ position: 'absolute', left: '6px', top: '0', bottom: '0', width: '2px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                          </div>
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{book.title}</h3>
                          <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{book.author}</p>
                          <div style={{ marginTop: 'auto' }}>
                            <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.9rem' }} onClick={() => handleIssue(book.id)} disabled={book.availableCopies <= 0 || myIssues.some(i => i.bookId === book.id && i.status === 'issued')}>
                              Issue Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>All Books</h2>
                <div className="search-container">
                  <Search className="search-icon" size={20} />
                  <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search books by title or author..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Books Issued: <strong style={{ color: activeIssues.length >= 3 ? 'var(--danger)' : 'var(--text-main)' }}>{activeIssues.length} / 3</strong>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {filteredBooks.map((book, idx) => {
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
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span className="category-badge">{book.category}</span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>{book.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>By {book.author}</p>
                      
                      <div style={{ marginTop: 'auto' }}>
                        {isIssued ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.95rem', fontWeight: '600' }}>
                            <CheckCircle size={18} /> Currently Issued
                          </div>
                        ) : (
                          <>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: book.availableCopies > 0 ? 'var(--success)' : 'var(--danger)' }}>
                                {book.availableCopies} {book.availableCopies === 1 ? 'copy' : 'copies'} left
                              </span>
                            </div>
                            <button 
                              className="btn btn-primary" 
                              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                              onClick={() => handleIssue(book.id)}
                              disabled={book.availableCopies <= 0}
                            >
                              {book.availableCopies <= 0 ? 'Out of Stock' : 'Issue Book'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredBooks.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  No books found matching your search.
                </div>
              )}
            </div>
            </div>
          )}

          {activeTab === 'my-issues' && (
            <div className="stagger-1">
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
                        <th>Issue Date</th>
                        <th>Due Date</th>
                        <th>Fine</th>
                        <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myIssues.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)).map(issue => {
                        const book = books.find(b => b.id === issue.bookId);
                        const fine = calculateFine(issue.dueDate);
                        const isOverdue = fine > 0 && issue.status === 'issued';
                        return (
                          <tr key={issue.id} style={{ backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                            <td style={{ padding: '1.5rem 2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '32px', height: '48px', backgroundColor: book?.color || '#333', borderRadius: '3px', boxShadow: '2px 2px 5px rgba(0,0,0,0.3)' }}></div>
                                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{book?.title || 'Unknown Book'}</span>
                              </div>
                            </td>
                            <td style={{ color: 'var(--text-muted)' }}>
                              {new Date(issue.issueDate).toLocaleDateString()}
                            </td>
                            <td style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>
                              {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', fontWeight: isOverdue ? 600 : 400 }}>
                              {issue.status === 'issued' ? (fine > 0 ? `₹${fine}` : 'No Fine') : '-'}
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                              {issue.status === 'issued' ? (
                                <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => handleReturn(issue.id)}>
                                  <RotateCcw size={16} /> Return
                                </button>
                              ) : (
                                <span className="status-returned status-badge" style={{ padding: '0.4rem 1rem' }}>
                                  Returned
                                </span>
                              )}
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
