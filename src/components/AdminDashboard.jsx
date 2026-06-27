import React, { useState, useMemo } from 'react';
import { useStore, calculateFine } from '../store';
import { Users, Book, Clock, LogOut, Plus, Trash2, LibraryBig, TrendingUp, UserPlus, BookPlus, Search, Copy, Edit2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const { users, books, issues, addUser, removeUser, updateUser, addBook, removeBook, updateBook, logout, currentUser, addToast } = useStore(state => state);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Forms state
  const [newStudentName, setNewStudentName] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('Fiction');
  const [newBookCopies, setNewBookCopies] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserName, setEditUserName] = useState('');

  const [editingBookId, setEditingBookId] = useState(null);
  const [editBookData, setEditBookData] = useState({});

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
      addBook(newBookTitle, newBookAuthor, newBookCategory, randomColor, newBookCopies);
      addToast(`Book "${newBookTitle}" added to library with ${newBookCopies} copies.`, 'success');
      setNewBookTitle('');
      setNewBookAuthor('');
      setNewBookCategory('Fiction');
      setNewBookCopies(1);
    }
  };

  const handleSaveUser = (userId) => {
    if (editUserName.trim()) {
      updateUser(userId, { name: editUserName });
      addToast('Student updated successfully.', 'success');
      setEditingUserId(null);
    }
  };

  const handleSaveBook = (book) => {
    if (editBookData.title.trim() && editBookData.author.trim()) {
      const diffCopies = parseInt(editBookData.totalCopies) - book.totalCopies;
      const newAvailable = Math.max(0, book.availableCopies + diffCopies);

      updateBook(book.id, {
        title: editBookData.title,
        author: editBookData.author,
        category: editBookData.category,
        totalCopies: parseInt(editBookData.totalCopies),
        availableCopies: newAvailable
      });
      addToast('Book updated successfully.', 'success');
      setEditingBookId(null);
    }
  };

  const studentsCount = users.filter(u => u.role === 'student').length;
  const booksCount = books.length;
  const activeIssuesCount = issues.filter(i => i.status === 'issued').length;

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Analytics Data Computation ---
  const CHART_COLORS = ['#8b5cf6', '#14b8a6', '#f59e0b', '#e11d48', '#3b82f6', '#ec4899', '#0ea5e9'];

  const categoryData = useMemo(() => {
    const map = {};
    books.forEach(b => { map[b.category] = (map[b.category] || 0) + 1; });
    return Object.keys(map).map(key => ({ name: key, value: map[key] }));
  }, [books]);

  const inventoryData = useMemo(() => {
    let avail = 0, issued = 0;
    books.forEach(b => { avail += b.availableCopies; issued += (b.totalCopies - b.availableCopies); });
    return [
      { name: 'Available', count: avail, fill: 'var(--success)' },
      { name: 'Issued', count: issued, fill: 'var(--accent-primary)' }
    ];
  }, [books]);

  const activityData = useMemo(() => {
    const last7Days = Array.from({length: 7}).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { dateStr: d.toLocaleDateString(), shortDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), issues: 0 };
    });
    
    issues.forEach(issue => {
      const issueDateStr = new Date(issue.issueDate).toLocaleDateString();
      const dayData = last7Days.find(d => d.dateStr === issueDateStr);
      if (dayData) dayData.issues += 1;
    });
    return last7Days;
  }, [issues]);

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
            <>
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

              {/* Analytics Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                
                {/* Category Pie Chart */}
                <div className="card stagger-2" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>Books by Category</h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', borderRadius: '8px' }} itemStyle={{ color: 'var(--text-main)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                    {categoryData.map((entry, index) => (
                      <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}></div>
                        {entry.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inventory Health Bar Chart */}
                <div className="card stagger-3" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>Inventory Health</h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activity Line Chart */}
                <div className="card stagger-4" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                  <h3 style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem' }}>Issues (Last 7 Days)</h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={activityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="shortDate" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="issues" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-surface)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
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
                        <td style={{ fontWeight: '500', fontSize: '1.1rem' }}>
                          {editingUserId === student.id ? (
                            <input 
                              type="text" 
                              className="input-field" 
                              value={editUserName} 
                              onChange={e => setEditUserName(e.target.value)} 
                              autoFocus
                              style={{ padding: '0.5rem', width: '250px' }}
                            />
                          ) : (
                            student.name
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {editingUserId === student.id ? (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button className="btn btn-success" onClick={() => handleSaveUser(student.id)} style={{ padding: '0.5rem' }}><Save size={18} /></button>
                              <button className="btn btn-secondary" onClick={() => setEditingUserId(null)} style={{ padding: '0.5rem' }}><X size={18} /></button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button className="btn btn-primary" onClick={() => { setEditingUserId(student.id); setEditUserName(student.name); }} style={{ padding: '0.5rem' }}>
                                <Edit2 size={18} />
                              </button>
                              <button className="btn btn-danger" onClick={() => { removeUser(student.id); addToast('Student removed', 'info'); }} style={{ padding: '0.5rem' }}>
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
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
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    placeholder="Copies"
                    value={newBookCopies}
                    onChange={(e) => setNewBookCopies(e.target.value)}
                    style={{ width: '100px', padding: '1rem', fontSize: '1.05rem' }}
                  />
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
                      <th style={{ textAlign: 'center' }}>Available / Total</th>
                      <th style={{ width: '120px' }}>Color</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map(book => (
                      <tr key={book.id}>
                        <td style={{ padding: '1.5rem 2rem', fontWeight: '500', fontSize: '1.1rem' }}>
                          {editingBookId === book.id ? (
                            <input className="input-field" value={editBookData.title} onChange={e => setEditBookData({...editBookData, title: e.target.value})} style={{ padding: '0.5rem', width: '100%' }} />
                          ) : book.title}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                          {editingBookId === book.id ? (
                            <input className="input-field" value={editBookData.author} onChange={e => setEditBookData({...editBookData, author: e.target.value})} style={{ padding: '0.5rem', width: '100%' }} />
                          ) : book.author}
                        </td>
                        <td>
                          {editingBookId === book.id ? (
                            <select className="input-field" value={editBookData.category} onChange={e => setEditBookData({...editBookData, category: e.target.value})} style={{ padding: '0.5rem' }}>
                              <option value="Fiction">Fiction</option>
                              <option value="Sci-Fi">Sci-Fi</option>
                              <option value="Tech">Tech</option>
                              <option value="History">History</option>
                              <option value="Biography">Biography</option>
                            </select>
                          ) : (
                            <span className="category-badge">{book.category}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                          {editingBookId === book.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                              <span style={{ color: book.availableCopies > 0 ? 'var(--success)' : 'var(--danger)' }}>{book.availableCopies}</span> /
                              <input type="number" min="1" className="input-field" value={editBookData.totalCopies} onChange={e => setEditBookData({...editBookData, totalCopies: e.target.value})} style={{ padding: '0.5rem', width: '60px' }} />
                            </div>
                          ) : (
                            <><span style={{ color: book.availableCopies > 0 ? 'var(--success)' : 'var(--danger)' }}>{book.availableCopies}</span> / {book.totalCopies}</>
                          )}
                        </td>
                        <td>
                          <div style={{ width: '30px', height: '30px', backgroundColor: book.color, borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: `0 0 10px ${book.color}40` }}></div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {editingBookId === book.id ? (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button className="btn btn-success" onClick={() => handleSaveBook(book)} style={{ padding: '0.5rem' }}><Save size={18} /></button>
                              <button className="btn btn-secondary" onClick={() => setEditingBookId(null)} style={{ padding: '0.5rem' }}><X size={18} /></button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button className="btn btn-primary" onClick={() => { setEditingBookId(book.id); setEditBookData({ title: book.title, author: book.author, category: book.category, totalCopies: book.totalCopies }); }} style={{ padding: '0.5rem' }}>
                                <Edit2 size={18} />
                              </button>
                              <button className="btn btn-danger" onClick={() => { removeBook(book.id); addToast('Book removed', 'info'); }} style={{ padding: '0.5rem' }}>
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
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
                      <th>Issue Date</th>
                      <th>Due Date</th>
                      <th>Fine</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map(issue => {
                      const student = users.find(u => u.id === issue.studentId);
                      const book = books.find(b => b.id === issue.bookId);
                      const fine = calculateFine(issue.dueDate);
                      return (
                        <tr key={issue.id}>
                          <td style={{ padding: '1.5rem 2rem', fontWeight: '500', fontSize: '1.1rem' }}>{student ? student.name : 'Unknown'}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>{book ? book.title : 'Unknown'}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{new Date(issue.issueDate).toLocaleDateString()}</td>
                          <td style={{ color: fine > 0 && issue.status === 'issued' ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ color: fine > 0 && issue.status === 'issued' ? 'var(--danger)' : 'var(--text-muted)' }}>
                            {issue.status === 'issued' ? (fine > 0 ? `₹${fine}` : 'No Fine') : '-'}
                          </td>
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
