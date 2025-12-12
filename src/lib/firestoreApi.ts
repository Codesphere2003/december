import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { CourtCase, CourtCaseFormData, CourtCasesResponse } from '@/types/courtCase';
import { mockCourtCases } from './mockData';

const CASES_COLLECTION = 'cases';

class FirestoreApiClient {
  async getCourtCases(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<CourtCasesResponse> {
    const casesRef = collection(db, CASES_COLLECTION);
    const q = query(casesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    let cases: CourtCase[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    } as CourtCase));

    // Simple search filter
    if (params.search) {
      const term = params.search.toLowerCase();
      cases = cases.filter(c =>
        c.caseTitle.toLowerCase().includes(term) ||
        c.caseNumber.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (params.status && params.status !== 'all') {
      cases = cases.filter(c => c.status === params.status);
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const start = (page - 1) * limit;
    const paginatedCases = cases.slice(start, start + limit);

    return {
      cases: paginatedCases,
      pagination: {
        page,
        limit,
        total: cases.length,
        totalPages: Math.ceil(cases.length / limit),
      },
    };
  }

  async createCourtCase(data: CourtCaseFormData, file?: File): Promise<{ message: string; id: string }> {
    const casesRef = collection(db, CASES_COLLECTION);
    
    const newCase = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(casesRef, newCase);
    return { message: 'Court case created successfully', id: docRef.id };
  }

  async updateCourtCase(id: string, data: CourtCaseFormData, file?: File): Promise<{ message: string }> {
    const docRef = doc(db, CASES_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    return { message: 'Court case updated successfully' };
  }

  async deleteCourtCase(id: string): Promise<{ message: string }> {
    const docRef = doc(db, CASES_COLLECTION, id);
    await deleteDoc(docRef);
    return { message: 'Court case deleted successfully' };
  }

  // Seed initial data if collection is empty
  async seedInitialData(): Promise<void> {
    const casesRef = collection(db, CASES_COLLECTION);
    const snapshot = await getDocs(casesRef);
    
    if (snapshot.empty) {
      console.log('Seeding initial court cases data...');
      for (const caseData of mockCourtCases) {
        const { id, createdAt, updatedAt, ...data } = caseData;
        await addDoc(casesRef, {
          ...data,
          createdAt: Timestamp.fromDate(new Date(createdAt)),
          updatedAt: Timestamp.fromDate(new Date(updatedAt)),
        });
      }
      console.log('Initial data seeded successfully!');
    }
  }
}

export const firestoreApiClient = new FirestoreApiClient();
