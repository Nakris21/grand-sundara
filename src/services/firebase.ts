/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase Configuration & Service Layer - Grand Sundara Digital
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import {
  UserAccount,
  UserRole,
  AccountStatus,
  Family,
  Resident,
  CashTransaction,
  BusinessListing,
  Announcement,
  EventItem,
} from '../types';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyMockKeyForDevelopmentOnly12345',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'grand-sundara-digital.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'grand-sundara-digital',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'grand-sundara-digital.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Fetch user authorization account profile from Firestore
 */
export async function fetchUserAccount(uid: string): Promise<UserAccount | null> {
  try {
    const userDocRef = doc(db, 'user_accounts', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        username: data.username || data.email || 'user',
        authEmail: data.auth_email || data.authEmail || data.email || '',
        email: data.email || '',
        fullName: data.fullName || 'Warga Grand Sundara',
        role: data.role || 'resident',
        familyId: data.family_id || data.familyId,
        residentId: data.resident_id || data.residentId,
        accountStatus: data.account_status || data.accountStatus || 'active',
        forcePasswordChange: data.force_password_change ?? data.forcePasswordChange ?? false,
        createdAt: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.warn('Firestore fetchUserAccount offline/fallback:', error);
    return null;
  }
}

/**
 * Log audit action to Firestore
 */
export async function recordAuditLog(
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  changedFieldsSummary?: Record<string, any>
): Promise<void> {
  try {
    if (!auth.currentUser) {
      return;
    }
    const auditRef = doc(collection(db, 'audit_logs'));
    await setDoc(auditRef, {
      id: auditRef.id,
      actor_user_id: actorUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changed_fields_summary: changedFieldsSummary || null,
      created_at: Timestamp.now(),
    });
  } catch (error) {
    console.warn('Audit log write warning:', error);
  }
}

/**
 * Firestore Families Persistence
 */
export async function fetchFamiliesFromFirestore(): Promise<Family[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'families'));
    const families: Family[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      families.push({
        id: docSnap.id,
        block: data.block || 'A',
        houseNumber: data.house_number || data.houseNumber || '01',
        addressNote: data.address_note || data.addressNote || '',
        siteplanRegionId: data.siteplan_region_id || data.siteplanRegionId,
        status: data.status || 'active',
        createdAt: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });
    return families;
  } catch (err) {
    console.warn('Firestore families fetch fallback:', err);
    return [];
  }
}

export async function saveFamilyToFirestore(family: Family): Promise<void> {
  try {
    const docRef = doc(db, 'families', family.id);
    await setDoc(docRef, {
      id: family.id,
      block: family.block,
      house_number: family.houseNumber,
      address_note: family.addressNote || '',
      siteplan_region_id: family.siteplanRegionId || null,
      status: family.status,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore family save warning (saved locally):', err);
  }
}

/**
 * Firestore Residents Persistence
 */
export async function fetchResidentsFromFirestore(): Promise<Resident[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'residents'));
    const residents: Resident[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      residents.push({
        id: docSnap.id,
        familyId: data.family_id || data.familyId || '',
        fullName: data.full_name || data.fullName || '',
        birthPlace: data.birth_place || data.birthPlace || '',
        birthDate: data.birth_date || data.birthDate || '',
        occupation: data.occupation || '',
        phoneNumber: data.phone_number || data.phoneNumber || '',
        familyRelationship: data.family_relationship || data.familyRelationship || 'Anak',
        linkedUserId: data.linked_user_id || data.linkedUserId,
        profileVisibility: data.profile_visibility || { showPhone: true, showOccupation: true },
        verificationStatus: data.verification_status || data.verificationStatus || 'verified',
        createdAt: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });
    return residents;
  } catch (err) {
    console.warn('Firestore residents fetch fallback:', err);
    return [];
  }
}

export async function saveResidentToFirestore(resident: Resident): Promise<void> {
  try {
    const docRef = doc(db, 'residents', resident.id);
    await setDoc(docRef, {
      id: resident.id,
      family_id: resident.familyId,
      full_name: resident.fullName,
      birth_place: resident.birthPlace || null,
      birth_date: resident.birthDate || null,
      occupation: resident.occupation || null,
      phone_number: resident.phoneNumber || null,
      family_relationship: resident.familyRelationship,
      linked_user_id: resident.linkedUserId || null,
      profile_visibility: resident.profileVisibility,
      verification_status: resident.verificationStatus,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore resident save warning (saved locally):', err);
  }
}

/**
 * Firestore Cash Transactions Persistence
 */
export async function fetchCashTransactionsFromFirestore(): Promise<CashTransaction[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'cash_transactions'));
    const txs: CashTransaction[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      txs.push({
        id: docSnap.id,
        transactionDate: data.transaction_date || data.transactionDate || '',
        transactionType: data.transaction_type || data.transactionType || 'income',
        description: data.description || '',
        amountIn: data.amount_in || data.amountIn || 0,
        amountOut: data.amount_out || data.amountOut || 0,
        balanceAfter: data.balance_after || data.balanceAfter || 0,
        note: data.note,
        status: data.status || 'published',
        createdBy: data.created_by || data.createdBy || '',
        createdAt: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });
    return txs;
  } catch (err) {
    console.warn('Firestore cash transactions fetch fallback:', err);
    return [];
  }
}

export async function saveCashTransactionToFirestore(trx: CashTransaction): Promise<void> {
  try {
    const docRef = doc(db, 'cash_transactions', trx.id);
    await setDoc(docRef, {
      id: trx.id,
      transaction_date: trx.transactionDate,
      transaction_type: trx.transactionType,
      description: trx.description,
      amount_in: trx.amountIn,
      amount_out: trx.amountOut,
      balance_after: trx.balanceAfter,
      note: trx.note || null,
      status: trx.status,
      created_by: trx.createdBy,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore cash transaction save warning:', err);
  }
}

/**
 * Firestore Business Listings Persistence
 */
export async function fetchBusinessListingsFromFirestore(): Promise<BusinessListing[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'business_listings'));
    const items: BusinessListing[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        ownerResidentId: data.owner_resident_id || data.ownerResidentId || '',
        businessName: data.business_name || data.businessName || '',
        category: data.category || '',
        description: data.description,
        whatsappNumber: data.whatsapp_number || data.whatsappNumber,
        socialUrl: data.social_url || data.socialUrl,
        status: data.status || 'approved',
        createdAt: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });
    return items;
  } catch (err) {
    console.warn('Firestore business listings fetch fallback:', err);
    return [];
  }
}

export async function saveBusinessListingToFirestore(biz: BusinessListing): Promise<void> {
  try {
    const docRef = doc(db, 'business_listings', biz.id);
    await setDoc(docRef, {
      id: biz.id,
      owner_resident_id: biz.ownerResidentId,
      business_name: biz.businessName,
      category: biz.category,
      description: biz.description || null,
      whatsapp_number: biz.whatsappNumber || null,
      social_url: biz.socialUrl || null,
      status: biz.status,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore business listing save warning:', err);
  }
}

/**
 * Firestore Announcements Persistence
 */
export async function fetchAnnouncementsFromFirestore(): Promise<Announcement[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'announcements'));
    const items: Announcement[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        title: data.title || '',
        body: data.body || '',
        publishedAt: data.published_at || data.publishedAt,
        status: data.status || 'published',
        createdBy: data.created_by || data.createdBy || '',
        createdAt: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });
    return items;
  } catch (err) {
    console.warn('Firestore announcements fetch fallback:', err);
    return [];
  }
}

export async function saveAnnouncementToFirestore(ann: Announcement): Promise<void> {
  try {
    const docRef = doc(db, 'announcements', ann.id);
    await setDoc(docRef, {
      id: ann.id,
      title: ann.title,
      body: ann.body,
      published_at: ann.publishedAt || null,
      status: ann.status,
      created_by: ann.createdBy,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore announcement save warning:', err);
  }
}

/**
 * Firestore Events Persistence
 */
export async function fetchEventsFromFirestore(): Promise<EventItem[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'events'));
    const items: EventItem[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      items.push({
        id: docSnap.id,
        title: data.title || '',
        description: data.description,
        eventDate: data.event_date || data.eventDate || '',
        location: data.location,
        instagramUrl: data.instagram_url || data.instagramUrl,
        status: data.status || 'published',
        createdBy: data.created_by || data.createdBy || '',
        createdAt: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });
    return items;
  } catch (err) {
    console.warn('Firestore events fetch fallback:', err);
    return [];
  }
}

export async function saveEventToFirestore(ev: EventItem): Promise<void> {
  try {
    const docRef = doc(db, 'events', ev.id);
    await setDoc(docRef, {
      id: ev.id,
      title: ev.title,
      description: ev.description || null,
      event_date: ev.eventDate,
      location: ev.location || null,
      instagram_url: ev.instagramUrl || null,
      status: ev.status,
      created_by: ev.createdBy,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore event save warning:', err);
  }
}
