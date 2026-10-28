/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized Data Adapter Layer - Grand Sundara Digital
 * Supports dual mode: 'firebase' (Cloud Firestore) and 'local' (localStorage fallback for robust development).
 */

import {
  Family,
  Resident,
  CashTransaction,
  BusinessListing,
  Announcement,
  EventItem,
} from '../types';
import {
  MOCK_FAMILIES,
  MOCK_RESIDENTS,
  MOCK_CASH_TRANSACTIONS,
  MOCK_BUSINESS_LISTINGS,
  MOCK_ANNOUNCEMENTS,
  MOCK_EVENTS,
} from '../data/mockData';
import {
  fetchFamiliesFromFirestore,
  saveFamilyToFirestore,
  fetchResidentsFromFirestore,
  saveResidentToFirestore,
  fetchCashTransactionsFromFirestore,
  saveCashTransactionToFirestore,
  fetchBusinessListingsFromFirestore,
  saveBusinessListingToFirestore,
  fetchAnnouncementsFromFirestore,
  saveAnnouncementToFirestore,
  fetchEventsFromFirestore,
  saveEventToFirestore,
  auth,
} from './firebase';

// Determine data mode: 'firebase' or 'local'
const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'firebase';

const LOCAL_STORAGE_KEYS = {
  FAMILIES: 'grand_sundara_families_v1',
  RESIDENTS: 'grand_sundara_residents_v1',
  CASH: 'grand_sundara_cash_v1',
  BUSINESSES: 'grand_sundara_businesses_v1',
  ANNOUNCEMENTS: 'grand_sundara_announcements_v1',
  EVENTS: 'grand_sundara_events_v1',
};

export const getDataMode = (): string => DATA_MODE;

/**
 * FAMILIES ADAPTER
 */
export async function getFamilies(): Promise<Family[]> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      const data = await fetchFamiliesFromFirestore();
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('Firebase families fetch error, falling back to local storage:', err);
    }
  }

  // Local Storage fallback
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.FAMILIES);
    if (stored) {
      return JSON.parse(stored);
    }
    // Seed initial mock data
    localStorage.setItem(LOCAL_STORAGE_KEYS.FAMILIES, JSON.stringify(MOCK_FAMILIES));
    return MOCK_FAMILIES;
  } catch (err) {
    console.error('Local storage families error:', err);
    return MOCK_FAMILIES;
  }
}

export async function saveFamily(family: Family): Promise<void> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      await saveFamilyToFirestore(family);
    } catch (err) {
      console.error('Firebase family save error:', err);
      throw err;
    }
  }

  // Update local storage
  const current = await getFamilies();
  const index = current.findIndex((f) => f.id === family.id);
  let updated: Family[];
  if (index >= 0) {
    updated = current.map((f) => (f.id === family.id ? family : f));
  } else {
    updated = [family, ...current];
  }
  localStorage.setItem(LOCAL_STORAGE_KEYS.FAMILIES, JSON.stringify(updated));
}

/**
 * RESIDENTS ADAPTER
 */
export async function getResidents(): Promise<Resident[]> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      const data = await fetchResidentsFromFirestore();
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('Firebase residents fetch error, falling back to local storage:', err);
    }
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.RESIDENTS);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.RESIDENTS, JSON.stringify(MOCK_RESIDENTS));
    return MOCK_RESIDENTS;
  } catch (err) {
    console.error('Local storage residents error:', err);
    return MOCK_RESIDENTS;
  }
}

export async function saveResident(resident: Resident): Promise<void> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      await saveResidentToFirestore(resident);
    } catch (err) {
      console.error('Firebase resident save error:', err);
      throw err;
    }
  }

  const current = await getResidents();
  const index = current.findIndex((r) => r.id === resident.id);
  let updated: Resident[];
  if (index >= 0) {
    updated = current.map((r) => (r.id === resident.id ? resident : r));
  } else {
    updated = [...current, resident];
  }
  localStorage.setItem(LOCAL_STORAGE_KEYS.RESIDENTS, JSON.stringify(updated));
}

/**
 * CASH TRANSACTIONS ADAPTER
 */
export async function getCashTransactions(): Promise<CashTransaction[]> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      const data = await fetchCashTransactionsFromFirestore();
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('Firebase cash fetch error, falling back to local storage:', err);
    }
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CASH);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.CASH, JSON.stringify(MOCK_CASH_TRANSACTIONS));
    return MOCK_CASH_TRANSACTIONS;
  } catch (err) {
    console.error('Local storage cash error:', err);
    return MOCK_CASH_TRANSACTIONS;
  }
}

export async function saveCashTransaction(trx: CashTransaction): Promise<void> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      await saveCashTransactionToFirestore(trx);
    } catch (err) {
      console.error('Firebase cash save error:', err);
      throw err;
    }
  }

  const current = await getCashTransactions();
  const updated = [...current, trx];
  localStorage.setItem(LOCAL_STORAGE_KEYS.CASH, JSON.stringify(updated));
}

/**
 * BUSINESS LISTINGS ADAPTER
 */
export async function getBusinessListings(): Promise<BusinessListing[]> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      const data = await fetchBusinessListingsFromFirestore();
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('Firebase business fetch error, falling back to local storage:', err);
    }
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.BUSINESSES);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.BUSINESSES, JSON.stringify(MOCK_BUSINESS_LISTINGS));
    return MOCK_BUSINESS_LISTINGS;
  } catch (err) {
    console.error('Local storage business error:', err);
    return MOCK_BUSINESS_LISTINGS;
  }
}

export async function saveBusinessListing(biz: BusinessListing): Promise<void> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      await saveBusinessListingToFirestore(biz);
    } catch (err) {
      console.error('Firebase business save error:', err);
      throw err;
    }
  }

  const current = await getBusinessListings();
  const index = current.findIndex((b) => b.id === biz.id);
  let updated: BusinessListing[];
  if (index >= 0) {
    updated = current.map((b) => (b.id === biz.id ? biz : b));
  } else {
    updated = [biz, ...current];
  }
  localStorage.setItem(LOCAL_STORAGE_KEYS.BUSINESSES, JSON.stringify(updated));
}

/**
 * ANNOUNCEMENTS ADAPTER
 */
export async function getAnnouncements(): Promise<Announcement[]> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      const data = await fetchAnnouncementsFromFirestore();
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('Firebase announcements fetch error, falling back to local storage:', err);
    }
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(MOCK_ANNOUNCEMENTS));
    return MOCK_ANNOUNCEMENTS;
  } catch (err) {
    console.error('Local storage announcements error:', err);
    return MOCK_ANNOUNCEMENTS;
  }
}

export async function saveAnnouncement(ann: Announcement): Promise<void> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      await saveAnnouncementToFirestore(ann);
    } catch (err) {
      console.error('Firebase announcement save error:', err);
      throw err;
    }
  }

  const current = await getAnnouncements();
  const updated = [ann, ...current];
  localStorage.setItem(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
}

/**
 * EVENTS ADAPTER
 */
export async function getEvents(): Promise<EventItem[]> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      const data = await fetchEventsFromFirestore();
      if (data && data.length > 0) return data;
    } catch (err) {
      console.warn('Firebase events fetch error, falling back to local storage:', err);
    }
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.EVENTS);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVENTS, JSON.stringify(MOCK_EVENTS));
    return MOCK_EVENTS;
  } catch (err) {
    console.error('Local storage events error:', err);
    return MOCK_EVENTS;
  }
}

export async function saveEvent(ev: EventItem): Promise<void> {
  if (DATA_MODE === 'firebase' && auth.currentUser) {
    try {
      await saveEventToFirestore(ev);
    } catch (err) {
      console.error('Firebase event save error:', err);
      throw err;
    }
  }

  const current = await getEvents();
  const updated = [ev, ...current];
  localStorage.setItem(LOCAL_STORAGE_KEYS.EVENTS, JSON.stringify(updated));
}
