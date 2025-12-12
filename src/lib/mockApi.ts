import { CourtCase, CourtCaseFormData, CourtCasesResponse } from '@/types/courtCase';
import { mockCourtCases } from './mockData';

// Mock API client for demo purposes
class MockApiClient {
  private cases: CourtCase[] = [...mockCourtCases];
  private isAuthenticated = false;

  // Simulate network delay
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(email: string, password: string) {
    await this.delay();
    if (email === 'admin@courtcases.com' && password === 'admin123') {
      this.isAuthenticated = true;
      return { success: true };
    }
    throw new Error('Invalid credentials');
  }

  async logout() {
    await this.delay(200);
    this.isAuthenticated = false;
  }

  async verifyToken() {
    await this.delay(200);
    return {
      user: {
        uid: 'demo-user',
        email: 'admin@courtcases.com',
        admin: this.isAuthenticated,
      },
    };
  }

  async getCourtCases(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<CourtCasesResponse> {
    await this.delay();

    let filteredCases = [...this.cases];

    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredCases = filteredCases.filter(
        (courtCase) =>
          courtCase.caseTitle.toLowerCase().includes(searchTerm) ||
          courtCase.caseNumber.toLowerCase().includes(searchTerm) ||
          (courtCase.description && courtCase.description.toLowerCase().includes(searchTerm))
      );
    }

    // Apply status filter
    if (params.status && params.status !== 'all') {
      filteredCases = filteredCases.filter(
        (courtCase) => courtCase.status === params.status
      );
    }

    // Apply sorting
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';
    
    filteredCases.sort((a, b) => {
      let aValue = a[sortBy as keyof CourtCase];
      let bValue = b[sortBy as keyof CourtCase];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCases = filteredCases.slice(startIndex, endIndex);

    return {
      cases: paginatedCases,
      pagination: {
        page,
        limit,
        total: filteredCases.length,
        totalPages: Math.ceil(filteredCases.length / limit),
      },
    };
  }

  async getCourtCase(id: string): Promise<CourtCase> {
    await this.delay();
    const courtCase = this.cases.find(c => c.id === id);
    if (!courtCase) {
      throw new Error('Court case not found');
    }
    return courtCase;
  }

  async createCourtCase(data: CourtCaseFormData, file?: File): Promise<{ message: string; id: string }> {
    await this.delay(1000);
    
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }

    // Check if case number already exists
    if (this.cases.some(c => c.caseNumber === data.caseNumber)) {
      throw new Error('Case number already exists');
    }

    const newCase: CourtCase = {
      id: Date.now().toString(),
      ...data,
      pdfFileUrl: file ? `https://demo-storage.com/${file.name}` : undefined,
      pdfFileName: file?.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.cases.unshift(newCase);
    return { message: 'Court case created successfully', id: newCase.id };
  }

  async updateCourtCase(id: string, data: CourtCaseFormData, file?: File): Promise<{ message: string }> {
    await this.delay(1000);
    
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }

    const index = this.cases.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Court case not found');
    }

    // Check if case number already exists (excluding current case)
    if (this.cases.some(c => c.caseNumber === data.caseNumber && c.id !== id)) {
      throw new Error('Case number already exists');
    }

    this.cases[index] = {
      ...this.cases[index],
      ...data,
      pdfFileUrl: file ? `https://demo-storage.com/${file.name}` : this.cases[index].pdfFileUrl,
      pdfFileName: file?.name || this.cases[index].pdfFileName,
      updatedAt: new Date(),
    };

    return { message: 'Court case updated successfully' };
  }

  async deleteCourtCase(id: string): Promise<{ message: string }> {
    await this.delay(500);
    
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }

    const index = this.cases.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Court case not found');
    }

    this.cases.splice(index, 1);
    return { message: 'Court case deleted successfully' };
  }
}

export const mockApiClient = new MockApiClient();