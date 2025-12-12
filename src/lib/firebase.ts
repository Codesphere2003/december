import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { CourtCase, CourtCaseFormData, CourtCasesResponse } from '@/types/courtCase';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAbXN9unFCNvTO2HtxFdgZkTA9NMcjJUo",
  authDomain: "diety-204b0.firebaseapp.com",
  projectId: "diety-204b0",
  storageBucket: "diety-204b0.firebasestorage.app",
  messagingSenderId: "1071397904810",
  appId: "1:1071397904810:web:7c157fa97c81ba3f104bd3",
  measurementId: "G-L3ZX67149E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const CASES_COLLECTION = 'cases';

// Demo cases data to seed the collection
const demoCases: Omit<CourtCase, 'id'>[] = [
  {
    caseTitle: 'Save Deities Temple vs Municipal Corporation',
    caseNumber: 'CWP-2024-001',
    description: 'Petition challenging the demolition notice issued by the municipal corporation for the ancient temple premises.',
    dateFiled: '2024-01-15',
    status: 'Active',
    courtName: 'High Court of Justice',
    judgeName: 'Hon. Justice R.K. Sharma',
    plaintiff: 'Save Deities Temple Trust',
    defendant: 'Municipal Corporation',
    caseType: 'Civil Writ Petition',
    priority: 'High',
    pdfFileUrl: 'https://example.com/case1.pdf',
    pdfFileName: 'Petition_CWP-2024-001.pdf',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    caseTitle: 'Heritage Protection Appeal',
    caseNumber: 'SLP-2024-002',
    description: 'Special Leave Petition for protection of heritage temple structure and surrounding archaeological sites.',
    dateFiled: '2024-02-20',
    status: 'Pending',
    courtName: 'Supreme Court of India',
    judgeName: 'Hon. Justice M.L. Verma',
    plaintiff: 'Heritage Conservation Society',
    defendant: 'State Government',
    caseType: 'Special Leave Petition',
    priority: 'High',
    pdfFileUrl: 'https://example.com/case2.pdf',
    pdfFileName: 'SLP_Heritage_Protection.pdf',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-12-08'),
  },
  {
    caseTitle: 'Land Acquisition Compensation',
    caseNumber: 'CA-2024-003',
    description: 'Appeal for fair compensation for temple land acquired for public infrastructure development.',
    dateFiled: '2024-03-10',
    status: 'Closed',
    courtName: 'District Court',
    judgeName: 'Hon. Justice S.P. Singh',
    plaintiff: 'Temple Management Committee',
    defendant: 'Land Acquisition Officer',
    caseType: 'Civil Appeal',
    priority: 'Medium',
    pdfFileUrl: 'https://example.com/case3.pdf',
    pdfFileName: 'Land_Compensation_Appeal.pdf',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-11-15'),
  },
  {
    caseTitle: 'Religious Freedom Protection',
    caseNumber: 'PIL-2024-004',
    description: 'Public Interest Litigation for protection of religious practices and freedom of worship at the temple.',
    dateFiled: '2024-04-05',
    status: 'Active',
    courtName: 'High Court of Justice',
    judgeName: 'Hon. Justice A.K. Gupta',
    plaintiff: 'Citizens for Religious Freedom',
    defendant: 'State of Delhi',
    caseType: 'Public Interest Litigation',
    priority: 'High',
    pdfFileUrl: 'https://example.com/case4.pdf',
    pdfFileName: 'Religious_Freedom_PIL.pdf',
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-12-12'),
  },
  {
    caseTitle: 'Environmental Clearance Challenge',
    caseNumber: 'NGT-2024-005',
    description: 'Challenge to environmental clearance granted for construction activities near the temple complex.',
    dateFiled: '2024-05-18',
    status: 'Pending',
    courtName: 'National Green Tribunal',
    judgeName: 'Hon. Justice Environmental Panel',
    plaintiff: 'Environmental Protection Group',
    defendant: 'Project Developer',
    caseType: 'Environmental Appeal',
    priority: 'Medium',
    createdAt: new Date('2024-05-18'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    caseTitle: 'Archaeological Survey Dispute',
    caseNumber: 'WP-2024-006',
    description: 'Writ petition regarding archaeological survey findings and their impact on temple operations.',
    dateFiled: '2024-06-22',
    status: 'Active',
    courtName: 'High Court of Justice',
    judgeName: 'Hon. Justice Cultural Heritage Bench',
    plaintiff: 'Archaeological Society',
    defendant: 'Archaeological Survey of India',
    caseType: 'Writ Petition',
    priority: 'Low',
    pdfFileUrl: 'https://example.com/case6.pdf',
    pdfFileName: 'Archaeological_Survey_Dispute.pdf',
    createdAt: new Date('2024-06-22'),
    updatedAt: new Date('2024-11-30'),
  },
];

// Convert Firestore document to CourtCase
const docToCourtCase = (docSnap: any): CourtCase => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    caseTitle: data.caseTitle,
    caseNumber: data.caseNumber,
    description: data.description,
    dateFiled: data.dateFiled,
    status: data.status,
    courtName: data.courtName,
    judgeName: data.judgeName,
    plaintiff: data.plaintiff,
    defendant: data.defendant,
    caseType: data.caseType,
    priority: data.priority,
    pdfFileUrl: data.pdfFileUrl,
    pdfFileName: data.pdfFileName,
    createdAt: data.createdAt?.toDate?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
  };
};

// Seed demo cases to Firestore (run once)
export const seedDemoCases = async (): Promise<void> => {
  const casesRef = collection(db, CASES_COLLECTION);
  const snapshot = await getDocs(casesRef);
  
  // Only seed if collection is empty
  if (snapshot.empty) {
    console.log('Seeding demo cases to Firestore...');
    for (const caseData of demoCases) {
      await addDoc(casesRef, {
        ...caseData,
        createdAt: Timestamp.fromDate(caseData.createdAt as Date),
        updatedAt: Timestamp.fromDate(caseData.updatedAt as Date),
      });
    }
    console.log('Demo cases seeded successfully!');
  }
};


// Firebase API Client - Direct Firestore operations
export const firebaseApi = {
  // Get all court cases with filtering, sorting, and pagination
  async getCourtCases(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<CourtCasesResponse> {
    const casesRef = collection(db, CASES_COLLECTION);
    
    // Build query
    let q = query(casesRef, orderBy(params.sortBy || 'createdAt', params.sortOrder || 'desc'));
    
    // Apply status filter at query level if possible
    if (params.status && params.status !== 'all') {
      q = query(casesRef, where('status', '==', params.status), orderBy(params.sortBy || 'createdAt', params.sortOrder || 'desc'));
    }
    
    const snapshot = await getDocs(q);
    let cases = snapshot.docs.map(docToCourtCase);

    // Apply search filter (client-side)
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      cases = cases.filter(
        (courtCase) =>
          courtCase.caseTitle.toLowerCase().includes(searchTerm) ||
          courtCase.caseNumber.toLowerCase().includes(searchTerm) ||
          (courtCase.description && courtCase.description.toLowerCase().includes(searchTerm))
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCases = cases.slice(startIndex, endIndex);

    return {
      cases: paginatedCases,
      pagination: {
        page,
        limit,
        total: cases.length,
        totalPages: Math.ceil(cases.length / limit),
      },
    };
  },

  // Get single court case by ID
  async getCourtCase(id: string): Promise<CourtCase> {
    const docRef = doc(db, CASES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Court case not found');
    }

    return docToCourtCase(docSnap);
  },

  // Create new court case
  async createCourtCase(data: CourtCaseFormData, file?: File): Promise<{ message: string; id: string }> {
    const casesRef = collection(db, CASES_COLLECTION);
    
    // Check if case number already exists
    const existingQuery = query(casesRef, where('caseNumber', '==', data.caseNumber));
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error('Case number already exists');
    }

    let pdfFileUrl: string | undefined;
    let pdfFileName: string | undefined;

    // Create the document first to get the ID
    const docRef = await addDoc(casesRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Upload file if provided
    if (file) {
      const fileRef = ref(storage, `court-cases/${docRef.id}/${file.name}`);
      await uploadBytes(fileRef, file);
      pdfFileUrl = await getDownloadURL(fileRef);
      pdfFileName = file.name;

      // Update document with file info
      await updateDoc(docRef, {
        pdfFileUrl,
        pdfFileName,
      });
    }

    return { message: 'Court case created successfully', id: docRef.id };
  },

  // Update existing court case
  async updateCourtCase(id: string, data: CourtCaseFormData, file?: File): Promise<{ message: string }> {
    const docRef = doc(db, CASES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Court case not found');
    }

    // Check if case number already exists (excluding current case)
    const casesRef = collection(db, CASES_COLLECTION);
    const existingQuery = query(casesRef, where('caseNumber', '==', data.caseNumber));
    const existingSnapshot = await getDocs(existingQuery);
    
    const existingCase = existingSnapshot.docs.find(d => d.id !== id);
    if (existingCase) {
      throw new Error('Case number already exists');
    }

    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    // Upload new file if provided
    if (file) {
      const fileRef = ref(storage, `court-cases/${id}/${file.name}`);
      await uploadBytes(fileRef, file);
      updateData.pdfFileUrl = await getDownloadURL(fileRef);
      updateData.pdfFileName = file.name;
    }

    await updateDoc(docRef, updateData);

    return { message: 'Court case updated successfully' };
  },

  // Delete court case
  async deleteCourtCase(id: string): Promise<{ message: string }> {
    const docRef = doc(db, CASES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Court case not found');
    }

    // Try to delete associated file
    const data = docSnap.data();
    if (data.pdfFileName) {
      try {
        const fileRef = ref(storage, `court-cases/${id}/${data.pdfFileName}`);
        await deleteObject(fileRef);
      } catch (error) {
        console.warn('Failed to delete file:', error);
      }
    }

    await deleteDoc(docRef);

    return { message: 'Court case deleted successfully' };
  },

  // Verify token (for auth compatibility)
  async verifyToken(): Promise<{ user: { uid: string; email: string; admin: boolean } | null }> {
    const user = auth.currentUser;
    if (user) {
      return {
        user: {
          uid: user.uid,
          email: user.email || '',
          admin: true, // For now, all authenticated users are admins
        },
      };
    }
    return { user: null };
  },
};

export default app;
