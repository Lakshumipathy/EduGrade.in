import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserRole = 'student' | 'teacher' | null;

interface AuthContextType {
  role: UserRole;
  userId: string | null;
  login: (role: UserRole, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as UserRole;
    const storedUserId = localStorage.getItem('userId');
    if (storedRole && storedUserId) {
      setRole(storedRole);
      setUserId(storedUserId);
    }
  }, []);

  const login = (userRole: UserRole, id: string) => {
    setRole(userRole);
    setUserId(id);
    localStorage.setItem('userRole', userRole || '');
    localStorage.setItem('userId', id);
  };

  const logout = () => {
    setRole(null);
    setUserId(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
