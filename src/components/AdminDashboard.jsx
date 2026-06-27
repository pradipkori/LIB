import React, { useState } from 'react';
import { useStore } from '../store';
import { Users, Book, Clock, LogOut, Plus, Trash2, LibraryBig, TrendingUp, UserPlus, BookPlus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { users, books, issues, addUser, removeUser, addBook, removeBook, logout, currentUser, addToast } = useStore(state => state);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Forms state
  const [newStudentName, setNewStudentName] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('Fiction');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      addUser(newStudentName, 'student');
      addToast(`Student "${newStudentName}" registered successfully.`, 'success');
      setNewStudentName('');
    }
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    if (newBookTitle.trim() && newBookAuthor.trim()) {
      const colors = ['#8b5cf6', '#e11d48', '#14b8a6', '#f59e0b', '#3b82f6', '#ec4899', '#0ea5e9'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      addBook(newBookTitle, newBookAuthor, newBookCategory, randomColor);
      addToast(`Book "${newBookTitle}" added to library.`, 'success');
      setNewBookTitle('');
      setNewBookAuthor('');
      setNewBookCategory('Fiction');
    }
  };

  const studentsCount = users.filter(u => u.role === 'student').length;
  const booksCount = books.length;
  const activeIssuesCount = issues.filter(i => i.status === 'issued').length;

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <LibraryBig color="var(--accent-primary)" size={28} style={{ marginRight: '1rem' }}/>
          <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, letterSpacing: '-0.03em' }}>Library<span style={{ color: 'var(--accent-primary)' }}>OS</span></h2>
        </div>
        
        <div className="sidebar-nav">
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <TrendingUp size={20} /> <span style={{ fontSize: '1rem' }}>Overview</span>
          </div>
          <div className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <Users size={20} /> <span style={{ fontSize: '1rem' }}>Students</span>
          </div>
          <div className={`nav-item ${activeTab === 'books' ? 'active' : ''}`} onClick={() => setActiveTab('books')}>
            <Book size={20} /> <span style={{ fontSize: '1rem' }}>Books</span>
          </div>
          <div className={`nav-item ${activeTab === 'issues' ? 'active' : ''}`} onClick={() => setActiveTab('issues')}>
            <Clock size={20} /> <span style={{ fontSize: '1rem' }}>Issues</span>
          </div>
        </div>

        <div style={{ padding: '2rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="var(--accent-primary)"/>
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{currentUser?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Administrator</div>
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-header" style={{ borderBottom: 'none', padding: '2rem 3rem 1rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--text-main)' }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
        </div>

        <div className="content-body" style={{ padding: '1rem 3rem 3rem' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <div className="card stat-card" style={{ borderTop: '4px solid var(--accent-primary)' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>Total Students</p>
                <div className="stat-value" style={{ fontSize: '3rem' }}>{studentsCount}</div>
              </div>
              <div className="card stat-card" style={{ borderTop: '4px solid var(--success)' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>Total Books</p>
                <div className="stat-value" style={{ fontSize: '3rem' }}>{booksCount}</div>
              </div>
              <div className="card stat-card" style={{ borderTop: '4px solid var(--warning)' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>Active Issues</p>
                <div className="stat-value" style={{ color: 'var(--warning)', fontSize: '3rem' }}>{activeIssuesCount}</div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <UserPlus color="var(--accent-primary)" />
                  <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Register New Student</h3>
                </div>
                {/* Wrapped in a proper form for better UX and reliability */}
                <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '1.5rem' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Enter student's full name" 
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    style={{ flex: 1, padding: '1rem', fontSize: '1.05rem' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem', fontSize: '1.05rem' }}>
                    <Plus size={20} /> Register
                  </button>
                </form>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '1.5rem 2rem' }}>ID</th>
                      <th>Name</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'student').map(student => (
                      <tr key={student.id}>
                        <td style={{ padding: '1.5rem 2rem' }}><span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{student.id}</span></td>
                        <td style={{ fontWeight: '500', fontSize: '1.1rem' }}>{student.name}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="btn btn-danger" onClick={() => { removeUser(student.id); addToast('Student removed', 'info'); }}>
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {studentsCount === 0 && (
                      <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>No students found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'books' && (
            <div className="stagger-1">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
              </div>
              <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <BookPlus color="var(--accent-primary)" />
                  <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Add New Book to Library</h3>
                </div>
                {/* Wrapped in a proper form */}
                <form onSubmit={handleAddBook} style={{ display: 'flex', gap: '1.5rem' }}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Book Title" 
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    style={{ flex: 1, padding: '1rem', fontSize: '1.05rem' }}
                  />
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Author" 
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    style={{ flex: 1, padding: '1rem', fontSize: '1.05rem' }}
                  />
                  <select
                    className="input-field"
                    value={newBookCategory}
                    onChange={(e) => setNewBookCategory(e.target.value)}
                    style={{ flex: 0.5, padding: '1rem', fontSize: '1.05rem', backgroundColor: 'var(--bg-dark)' }}
                  >
                    <option value="Fiction">Fiction</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Tech">Tech</option>
                    <option value="History">History</option>
                    <option value="Biography">Biography</option>
                  </select>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem', fontSize: '1.05rem' }}>
                    <Plus size={20} /> Add Book
                  </button>
                </form>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '1.5rem 2rem' }}>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th style={{ width: '120px' }}>Color</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map(book => (
                      <tr key={book.id}>
                        <td style={{ padding: '1.5rem 2rem', fontWeight: '500', fontSize: '1.1rem' }}>{book.title}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>{book.author}</td>
                        <td><span className="category-badge">{book.category}</span></td>
                        <td>
                          <div style={{ width: '30px', height: '30px', backgroundColor: book.color, borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: `0 0 10px ${book.color}40` }}></div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="btn btn-danger" onClick={() => { removeBook(book.id); addToast('Book removed', 'info'); }}>
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredBooks.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>No books found matching your search.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div>
              <div className="table-container" style={{ marginTop: '1rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '1.5rem 2rem' }}>Student</th>
                      <th>Book</th>
                      <th>Date Issued</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map(issue => {
                      const student = users.find(u => u.id === issue.studentId);
                      const book = books.find(b => b.id === issue.bookId);
                      return (
                        <tr key={issue.id}>
                          <td style={{ padding: '1.5rem 2rem', fontWeight: '500', fontSize: '1.1rem' }}>{student ? student.name : 'Unknown'}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>{book ? book.title : 'Unknown'}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{new Date(issue.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                          <td>
                            <span className={`status-badge ${issue.status === 'issued' ? 'status-issued' : 'status-returned'}`} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                              {issue.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {issues.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>No issues found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
