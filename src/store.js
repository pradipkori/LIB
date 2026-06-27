import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Initial Mock Data
const initialBooks = [
  { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', color: '#3b82f6' },
  { id: '2', title: '1984', author: 'George Orwell', category: 'Sci-Fi', color: '#10b981' },
  { id: '3', title: 'Dune', author: 'Frank Herbert', category: 'Sci-Fi', color: '#8b5cf6' },
  { id: '4', title: 'Neuromancer', author: 'William Gibson', category: 'Tech', color: '#0ea5e9' },
  { id: '5', title: 'Foundation', author: 'Isaac Asimov', category: 'Sci-Fi', color: '#ec4899' },
];

const initialUsers = [
  { id: 'admin1', name: 'Admin User', role: 'admin' },
  { id: 'student1', name: 'User', role: 'student' },
];

export const useStore = create(
  persist(
    (set) => ({
      currentUser: null,
      users: initialUsers,
      books: initialBooks,
      issues: [],
      toasts: [],

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
      addUser: (name, role) => set((state) => ({
        users: [...state.users, { id: `user_${Date.now()}`, name, role }]
      })),
      removeUser: (userId) => set((state) => ({
        users: state.users.filter(u => u.id !== userId)
      })),

      // Book Actions (Admin)
      addBook: (title, author, category, color) => set((state) => ({
        books: [...state.books, { id: `book_${Date.now()}`, title, author, category: category || 'Uncategorized', color: color || '#ccc' }]
      })),
      removeBook: (bookId) => set((state) => ({
        books: state.books.filter(b => b.id !== bookId)
      })),

      // Issue Actions (Student & Admin)
      issueBook: (bookId, studentId) => set((state) => {
        const isAlreadyIssued = state.issues.some(
          i => i.bookId === bookId && i.status === 'issued'
        );
        if (isAlreadyIssued) return state;

        const activeIssues = state.issues.filter(i => i.studentId === studentId && i.status === 'issued');
        if (activeIssues.length >= 3) {
          // Reject issue if limit is reached. The UI will also check this to show toast.
          return state;
        }

        const newIssue = {
          id: `issue_${Date.now()}`,
          bookId,
          studentId,
          issueDate: new Date().toISOString(),
          status: 'issued'
        };
        return { issues: [...state.issues, newIssue] };
      }),

      returnBook: (issueId) => set((state) => ({
        issues: state.issues.map(i =>
          i.id === issueId ? { ...i, status: 'returned' } : i
        )
      })),
    }),
    {
      name: 'library-os-v2', // Changed key to force fresh state and fix bugs
    }
  )
);
