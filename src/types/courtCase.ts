export interface CourtCase {
  id: string;
  caseTitle: string;
  caseNumber: string;
  description?: string;
  dateFiled: string;
  status: string;
  courtName?: string;
  judgeName?: string;
  plaintiff?: string;
  defendant?: string;
  caseType?: string;
  priority: string;
  pdfFileUrl?: string;
  pdfFileName?: string;
  createdAt: any;
  updatedAt: any;
}

export interface CourtCaseFormData {
  caseTitle: string;
  caseNumber: string;
  description?: string;
  dateFiled: string;
  status: string;
  courtName?: string;
  judgeName?: string;
  plaintiff?: string;
  defendant?: string;
  caseType?: string;
  priority: string;
}

export interface CourtCasesResponse {
  cases: CourtCase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}