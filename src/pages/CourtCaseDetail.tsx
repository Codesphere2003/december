import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Download, 
  User, 
  Building, 
  Gavel,
  AlertCircle,
  Scale,
  Loader2
} from 'lucide-react';
import { firebaseApi } from '@/lib/firebase';
import { format } from 'date-fns';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in court':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'settled':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function CourtCaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: courtCase, isLoading, error } = useQuery({
    queryKey: ['courtCase', id],
    queryFn: () => firebaseApi.getCourtCase(id!),
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleDownload = () => {
    if (courtCase?.pdfFileUrl) {
      window.open(courtCase.pdfFileUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !courtCase) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertDescription>
              Court case not found or failed to load.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => navigate('/court-cases')} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Court Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/court-cases')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cases
            </Button>
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Court Case Details</h1>
                <p className="text-sm text-gray-500">Case #{courtCase.caseNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Image */}
            {courtCase.imageUrl && (
              <Card>
                <CardContent className="p-0">
                  <img
                    src={courtCase.imageUrl}
                    alt={courtCase.caseTitle}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Case Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {courtCase.caseTitle}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="font-mono">
                        Case #{courtCase.caseNumber}
                      </Badge>
                      <Badge className={getStatusColor(courtCase.status)}>
                        {courtCase.status}
                      </Badge>
                      <Badge className={getPriorityColor(courtCase.priority)}>
                        {courtCase.priority} Priority
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {courtCase.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{courtCase.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Case Details */}
            <Card>
              <CardHeader>
                <CardTitle>Case Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date Filed</p>
                      <p className="font-medium">{formatDate(courtCase.dateFiled)}</p>
                    </div>
                  </div>

                  {courtCase.courtName && (
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Court</p>
                        <p className="font-medium">{courtCase.courtName}</p>
                      </div>
                    </div>
                  )}

                  {courtCase.judgeName && (
                    <div className="flex items-center gap-3">
                      <Gavel className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Judge</p>
                        <p className="font-medium">{courtCase.judgeName}</p>
                      </div>
                    </div>
                  )}

                  {courtCase.caseType && (
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Case Type</p>
                        <p className="font-medium">{courtCase.caseType}</p>
                      </div>
                    </div>
                  )}

                  {courtCase.plaintiff && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Plaintiff</p>
                        <p className="font-medium">{courtCase.plaintiff}</p>
                      </div>
                    </div>
                  )}

                  {courtCase.defendant && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Defendant</p>
                        <p className="font-medium">{courtCase.defendant}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {courtCase.pdfFileUrl && (
                  <Button 
                    onClick={handleDownload} 
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Document
                  </Button>
                )}
                <Button 
                  onClick={() => navigate('/court-cases')} 
                  className="w-full"
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to All Cases
                </Button>
              </CardContent>
            </Card>

            {/* Case Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Case Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className={getStatusColor(courtCase.status)}>
                    {courtCase.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Priority</span>
                  <Badge className={getPriorityColor(courtCase.priority)}>
                    {courtCase.priority}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Filed</span>
                  <span className="text-sm font-medium">{formatDate(courtCase.dateFiled)}</span>
                </div>
                {courtCase.pdfFileName && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">
                        {courtCase.pdfFileName}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}