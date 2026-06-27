import { create } from 'zustand';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// Initial Mock Data (Fallback if Firebase is not configured)
const initialBooks = [
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', color: '#3b82f6', totalCopies: 3, availableCopies: 3 },
  { id: '2', title: '1984', author: 'George Orwell', category: 'Sci-Fi', color: '#10b981', totalCopies: 2, availableCopies: 2 },
  { id: '3', title: 'Dune', author: 'Frank Herbert', category: 'Sci-Fi', color: '#8b5cf6', totalCopies: 1, availableCopies: 1 },
  { id: '4', title: 'Neuromancer', author: 'William Gibson', category: 'Tech', color: '#0ea5e9', totalCopies: 5, availableCopies: 5 },
  { id: '5', title: 'Foundation', author: 'Isaac Asimov', category: 'Sci-Fi', color: '#ec4899', totalCopies: 2, availableCopies: 2 },
];

const initialUsers = [
  { id: 'admin1', name: 'Admin User', role: 'admin' },
  { id: 'student1', name: 'John Doe', role: 'student' },
];

export const useStore = create((set, get) => ({
  currentUser: null,
  users: initialUsers,
  books: initialBooks,
  issues: [],
  toasts: [],
  isFirebaseConnected: false,

  // Toast Actions
  addToast: (message, type = 'info') => set((state) => ({
    toasts: [...state.toasts, { id: `toast_${Date.now()}`, message, type }]
  })),
  removeToast: (toastId) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== toastId)
  })),

  // Auth Actions
  login: (userId) => set((state) => {
    const user = state.users.find(u => u.id === userId);
    return { currentUser: user || null };
  }),
  logout: () => set({ currentUser: null }),

  // User Actions (Admin)
  addUser: async (name, role) => {
    const newUser = { id: `user_${Date.now()}`, name, role };
    if (db) {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } else {
      set((state) => ({ users: [...state.users, newUser] }));
    }
  },
  removeUser: async (userId) => {
    if (db) {
      await deleteDoc(doc(db, 'users', userId));
    } else {
      set((state) => ({ users: state.users.filter(u => u.id !== userId) }));
    }
  },
  updateUser: async (userId, updatedData) => {
    if (db) {
      await updateDoc(doc(db, 'users', userId), updatedData);
    } else {
      set((state) => ({ users: state.users.map(u => u.id === userId ? { ...u, ...updatedData } : u) }));
    }
  },

  // Book Actions (Admin)
  addBook: async (title, author, category, color, totalCopies) => {
    const newBook = { 
      id: `book_${Date.now()}`, 
      title, 
      author, 
      category: category || 'Uncategorized', 
      color: color || '#ccc',
      totalCopies: parseInt(totalCopies) || 1,
      availableCopies: parseInt(totalCopies) || 1
    };
    if (db) {
      await setDoc(doc(db, 'books', newBook.id), newBook);
    } else {
      set((state) => ({ books: [...state.books, newBook] }));
    }
  },
  removeBook: async (bookId) => {
    if (db) {
      await deleteDoc(doc(db, 'books', bookId));
    } else {
      set((state) => ({ books: state.books.filter(b => b.id !== bookId) }));
    }
  },
  updateBook: async (bookId, updatedData) => {
    if (db) {
      // If total copies are updated, we need to adjust available copies accordingly
      // This is handled partly in UI, but we just pass the updated data here.
      await updateDoc(doc(db, 'books', bookId), updatedData);
    } else {
      set((state) => ({ books: state.books.map(b => b.id === bookId ? { ...b, ...updatedData } : b) }));
    }
  },

  // Issue Actions (Student & Admin)
  issueBook: async (bookId, studentId) => {
    const state = get();
    const isAlreadyIssued = state.issues.some(
      i => i.bookId === bookId && i.status === 'issued'
    );
    if (isAlreadyIssued) return;

    const activeIssues = state.issues.filter(i => i.studentId === studentId && i.status === 'issued');
    if (activeIssues.length >= 3) {
      return; // Handled by UI
    }

    const book = state.books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) return;

    // Calculate Due Date (14 days from now)
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 14);

    const newIssue = {
      id: `issue_${Date.now()}`,
      bookId,
      studentId,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'issued'
    };

    if (db) {
      await setDoc(doc(db, 'issues', newIssue.id), newIssue);
      await updateDoc(doc(db, 'books', bookId), {
        availableCopies: book.availableCopies - 1
      });
    } else {
      set((state) => ({ 
        issues: [...state.issues, newIssue],
        books: state.books.map(b => b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b)
      }));
    }
  },

  returnBook: async (issueId) => {
    const state = get();
    const issue = state.issues.find(i => i.id === issueId);
    if (!issue) return;

    if (db) {
      await updateDoc(doc(db, 'issues', issueId), { status: 'returned' });
      const book = state.books.find(b => b.id === issue.bookId);
      if (book) {
        await updateDoc(doc(db, 'books', issue.bookId), { availableCopies: book.availableCopies + 1 });
      }
    } else {
      set((state) => ({
        issues: state.issues.map(i => i.id === issueId ? { ...i, status: 'returned' } : i),
        books: state.books.map(b => b.id === issue.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b)
      }));
    }
  },

  // Initialize Firebase Listeners
  initFirebaseListeners: () => {
    if (!db) return;
    set({ isFirebaseConnected: true });
    
    const unsubscribeBooks = onSnapshot(collection(db, 'books'), (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ books: booksData });
    });

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ users: usersData });
    });

    const unsubscribeIssues = onSnapshot(collection(db, 'issues'), (snapshot) => {
      const issuesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ issues: issuesData });
    });
  }
}));

// Utility to calculate fine
export const calculateFine = (dueDateString) => {
  if (!dueDateString) return 0;
  const dueDate = new Date(dueDateString);
  const now = new Date();
  if (now > dueDate) {
    const diffTime = Math.abs(now - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * 10; // ₹10 per day late
  }
  return 0;
};
