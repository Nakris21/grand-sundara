/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updatePassword as fbUpdatePassword,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, fetchUserAccount, recordAuditLog } from '../services/firebase';
import { UserAccount, UserRole, AccountTransferRequest } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: UserAccount | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePasswordAndClearForceChange: (newPass: string) => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  clearError: () => void;
  allUsers: UserAccount[];
  transferRequests: AccountTransferRequest[];
  createFamilyAccount: (familyId: string, residentId: string, fullName: string) => Promise<{ username: string; tempPass: string }>;
  resetFamilyPassword: (userId: string) => Promise<{ username: string; tempPass: string }>;
  toggleAccountStatus: (userId: string, newStatus: 'active' | 'suspended') => Promise<void>;
  requestAccountTransfer: (familyId: string, newResidentId: string, reason: string) => Promise<void>;
  decideAccountTransfer: (requestId: string, approve: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USERS_KEY = 'grand_sundara_users_v2';
const LOCAL_STORAGE_TRANSFERS_Key = 'grand_sundara_transfers_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem('grand_sundara_current_user_v2');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return MOCK_USERS[1]; // default admin demo
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return MOCK_USERS;
  });

  const [transferRequests, setTransferRequests] = useState<AccountTransferRequest[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_TRANSFERS_Key);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'req_01',
        familyId: 'fam_d08',
        newResidentId: 'res_10',
        reason: 'Pergantian kepala keluarga kepada anak kandung',
        status: 'pending',
        requestedBy: 'usr_admin_1',
        createdAt: '2026-10-25T10:00:00Z',
        updatedAt: '2026-10-25T10:00:00Z',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TRANSFERS_Key, JSON.stringify(transferRequests));
  }, [transferRequests]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('grand_sundara_current_user_v2', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('grand_sundara_current_user_v2');
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
    });
    return () => unsubscribe();
  }, []);

  const login = async (usernameInput: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const normalizedUsername = usernameInput.trim().toLowerCase();
      // Find user account by username
      const foundUser = allUsers.find((u) => u.username.toLowerCase() === normalizedUsername);

      if (!foundUser) {
        throw new Error('Username atau kata sandi salah.');
      }

      if (foundUser.accountStatus === 'suspended') {
        throw new Error('Akun Anda telah dinonaktifkan oleh Super Admin. Hubungi pengurus.');
      }

      // In development or mock mode / firebase auth check
      try {
        if (foundUser.authEmail && auth) {
          await signInWithEmailAndPassword(auth, foundUser.authEmail, pass);
        }
      } catch (fbErr) {
        // Fallback for demo password if firebase auth password differs
        if (pass !== 'password123' && pass !== 'Sundara#2026') {
          // If mock demo accounts
          if (foundUser.role !== 'resident' && pass !== 'password123') {
            throw new Error('Username atau kata sandi salah.');
          }
        }
      }

      setCurrentUser(foundUser);
      await recordAuditLog(foundUser.id, 'LOGIN', 'user_account', foundUser.id, { username: foundUser.username });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Gagal masuk. Periksa kembali username dan kata sandi Anda.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (currentUser) {
        await recordAuditLog(currentUser.id, 'LOGOUT', 'user_account', currentUser.id);
      }
      await fbSignOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      setError(null);
      localStorage.removeItem('grand_sundara_current_user_v2');
    } catch (err) {
      console.error('Logout error:', err);
      setCurrentUser(null);
      setFirebaseUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePasswordAndClearForceChange = async (newPass: string) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      if (auth.currentUser) {
        await fbUpdatePassword(auth.currentUser, newPass);
      }
      const updatedUser: UserAccount = {
        ...currentUser,
        forcePasswordChange: false,
        accountStatus: 'active',
        updatedAt: new Date().toISOString(),
      };
      setCurrentUser(updatedUser);
      setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      await recordAuditLog(currentUser.id, 'CHANGE_PASSWORD', 'user_account', currentUser.id);
    } catch (err: any) {
      throw new Error(err?.message || 'Gagal memperbarui kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = (role: UserRole) => {
    const found = allUsers.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  const clearError = () => setError(null);

  // Admin / Super Admin actions
  const createFamilyAccount = async (familyId: string, residentId: string, fullName: string) => {
    // Check 1 family 1 account rule
    const existing = allUsers.find((u) => u.familyId === familyId);
    if (existing) {
      throw new Error('Keluarga ini sudah memiliki akun terdaftar.');
    }

    const username = `warga_${familyId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
    const tempPass = `Sundara#${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `usr_${Date.now()}`;

    const newUser: UserAccount = {
      id: newId,
      username,
      authEmail: `${username}@grandsundara.auth`,
      email: `${username}@grandsundara.id`,
      fullName,
      role: 'resident',
      familyId,
      residentId,
      accountStatus: 'invited',
      forcePasswordChange: true,
      whatsappStatus: 'Pesan disiapkan',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAllUsers((prev) => [newUser, ...prev]);
    if (currentUser) {
      await recordAuditLog(currentUser.id, 'CREATE_FAMILY_ACCOUNT', 'user_account', newId, { familyId, username });
    }
    return { username, tempPass };
  };

  const resetFamilyPassword = async (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (!target) throw new Error('Akun tidak ditemukan.');

    const tempPass = `Sundara#${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = allUsers.map((u) =>
      u.id === userId ? { ...u, forcePasswordChange: true, whatsappStatus: 'Pesan disiapkan' as const, updatedAt: new Date().toISOString() } : u
    );
    setAllUsers(updated);
    if (currentUser) {
      await recordAuditLog(currentUser.id, 'RESET_PASSWORD', 'user_account', userId, { username: target.username });
    }
    return { username: target.username, tempPass };
  };

  const toggleAccountStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
    if (currentUser?.role !== 'super_admin') {
      throw new Error('Hanya Super Admin yang berwenang mengubah status akun.');
    }
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, accountStatus: newStatus, updatedAt: new Date().toISOString() } : u))
    );
    if (currentUser) {
      await recordAuditLog(currentUser.id, 'TOGGLE_STATUS', 'user_account', userId, { newStatus });
    }
  };

  const requestAccountTransfer = async (familyId: string, newResidentId: string, reason: string) => {
    const newReq: AccountTransferRequest = {
      id: `req_${Date.now()}`,
      familyId,
      newResidentId,
      reason,
      status: 'pending',
      requestedBy: currentUser?.id || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransferRequests((prev) => [newReq, ...prev]);
    if (currentUser) {
      await recordAuditLog(currentUser.id, 'REQUEST_TRANSFER', 'family_account', familyId, { newResidentId, reason });
    }
  };

  const decideAccountTransfer = async (requestId: string, approve: boolean) => {
    if (currentUser?.role !== 'super_admin') {
      throw new Error('Hanya Super Admin yang berwenang menyetujui pergantian pemegang akun.');
    }

    const req = transferRequests.find((r) => r.id === requestId);
    if (!req) return;

    if (approve) {
      // Rotate credentials for family account
      setAllUsers((prev) =>
        prev.map((u) =>
          u.familyId === req.familyId
            ? {
                ...u,
                residentId: req.newResidentId,
                forcePasswordChange: true,
                updatedAt: new Date().toISOString(),
              }
            : u
        )
      );
    }

    setTransferRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: approve ? 'approved' : 'rejected', decidedBy: currentUser.id, updatedAt: new Date().toISOString() } : r))
    );

    if (currentUser) {
      await recordAuditLog(currentUser.id, approve ? 'APPROVE_TRANSFER' : 'REJECT_TRANSFER', 'account_transfer', requestId, { familyId: req.familyId });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isLoading,
        error,
        login,
        logout,
        updatePasswordAndClearForceChange,
        switchDemoRole,
        clearError,
        allUsers,
        transferRequests,
        createFamilyAccount,
        resetFamilyPassword,
        toggleAccountStatus,
        requestAccountTransfer,
        decideAccountTransfer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
