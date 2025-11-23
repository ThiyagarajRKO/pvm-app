// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// PVM Record Types
export interface Record {
  id: number;
  slNo: string;
  date: string;
  name: string;
  fatherName: string;
  street: string;
  place: string;
  goldWeightGrams?: number;
  silverWeightGrams?: number;
  itemType: 'Gold' | 'Silver' | 'Both';
  itemCategory: 'active' | 'archived' | 'big';
  amount: number;
  interest: number;
  mobile: string;
  personImageUrl?: string;
  itemImageUrl?: string;
  itemReturnImageUrl?: string;
  isReturned?: boolean;
  returnedAmount?: number;
  returnedDate?: string;
  createdAt: string;
  updatedAt: string;
  daysOld?: number;
  monthsOld?: number;
  amountToBePaid?: number | null;
  calculatedInterestAmount?: number;
  calculatedTotalAmount?: number;
  interestMonths?: number;
}

// PVM Stats Types
export interface RecordStats {
  totalRecords: number;
  totalGoldCount: number;
  totalSilverCount: number;
  totalBothCount: number;
  totalGoldWeightGrams: number;
  totalSilverWeightGrams: number;
  totalAmount: number;
}

// S3 Upload Types
export interface PresignedUpload {
  uploadUrl: string;
  fileUrl: string;
  fileKey: string;
  expiresAt: string;
}

// Filter & Search Types
export interface SearchFilters {
  query?: string;
  itemType?: 'Gold' | 'Silver';
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
