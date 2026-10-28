export type UserRole = 'super_admin' | 'admin' | 'bendahara' | 'resident';

export type AccountStatus = 'invited' | 'active' | 'suspended';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type FamilyRelationship =
  | 'Kepala Keluarga'
  | 'Suami'
  | 'Istri'
  | 'Anak'
  | 'Ayah'
  | 'Ibu'
  | 'Cucu'
  | 'Menantu'
  | 'Mertua'
  | 'Saudara'
  | 'Famili Lainnya';

export interface UserAccount {
  id: string;
  username: string;
  authEmail: string;
  email?: string;
  fullName: string;
  role: UserRole;
  familyId?: string;
  residentId?: string;
  accountStatus: AccountStatus;
  forcePasswordChange: boolean;
  whatsappStatus?: 'Belum disiapkan' | 'Pesan disiapkan' | 'Dikonfirmasi Admin';
  createdAt: string;
  updatedAt: string;
}

export interface AccountTransferRequest {
  id: string;
  familyId: string;
  currentUserId?: string;
  currentResidentId?: string;
  newResidentId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  decidedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  block: string; // e.g. "A", "B", "C"
  houseNumber: string; // e.g. "05"
  addressNote?: string;
  siteplanRegionId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Resident {
  id: string;
  familyId: string;
  fullName: string;
  birthPlace?: string;
  birthDate?: string;
  occupation?: string;
  phoneNumber?: string;
  familyRelationship: FamilyRelationship;
  linkedUserId?: string;
  profileVisibility: {
    showPhone: boolean;
    showOccupation: boolean;
  };
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CashTransaction {
  id: string;
  transactionDate: string;
  transactionType: 'income' | 'expense';
  description: string;
  amountIn: number;
  amountOut: number;
  balanceAfter: number;
  note?: string;
  status: 'published' | 'voided';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashSettings {
  openingBalance: number;
  openingBalanceDate: string;
  updatedBy: string;
  updatedAt: string;
}

export interface BusinessListing {
  id: string;
  ownerResidentId: string;
  businessName: string;
  category: string;
  description?: string;
  whatsappNumber?: string;
  socialUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'inactive' | 'published' | 'pending_review' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt?: string;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
  instagramUrl?: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogItem {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  changedFieldsSummary?: Record<string, any>;
  createdAt: string;
}

export type ActivePage =
  | 'dashboard'
  | 'families'
  | 'siteplan'
  | 'cash'
  | 'businesses'
  | 'announcements'
  | 'events'
  | 'settings'
  | 'audit';
