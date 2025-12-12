import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Scale, LogOut, User, Home, ChevronRight, FileText, Calendar, Building, Gavel, MapPin } from 'lucide-react';
import { CourtCaseForm } from '@/components/court-cases/CourtCaseForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { firebaseApi } from '@/lib/firebase';
import { CourtCase, CourtCaseFormData } from '@/types/courtCase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Court Case Card Component matching the exact reference design
const CourtCaseCardNew: React.FC<{
  courtCase: CourtCase;
  onEdit?: (courtCase: CourtCase) => void;
  onDelete?: (id: string) => void;
  onDownload?: (courtCase: CourtCase) => void;
  showActions?: boolean;
}> = ({ courtCase, onEdit, onDelete, onDownload, showActions }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'In Progress';
      case 'pending':
        return 'In Progress';
      case 'closed':
        return 'Completed';
      default:
        return 'In Progress';
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 max-w-sm mx-auto">
      {/* Top Red Section with Om Pattern */}
      <div className="relative bg-red-600 h-64 flex items-center justify-center">
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
            {getStatusText(courtCase.status)}
          </span>
        </div>

        {/* Om Symbol Pattern */}
        <div className="absolute inset-0 opacity-20">
          {/* Large central Om */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-8xl text-red-800 font-bold select-none">ॐ</div>
          </div>
          
          {/* Corner Om symbols */}
          <div className="absolute top-6 left-6 text-3xl text-red-800 font-bold select-none">ॐ</div>
          <div className="absolute top-6 right-6 text-3xl text-red-800 font-bold select-none">ॐ</div>
          <div className="absolute bottom-6 left-6 text-3xl text-red-800 font-bold select-none">ॐ</div>
          <div className="absolute bottom-6 right-6 text-3xl text-red-800 font-bold select-none">ॐ</div>
        </div>

        {/* "Image Not Available" Text */}
        <div className="relative z-10 text-center">
          <div className="text-red-300 text-lg font-medium">
            Image Not Available
          </div>
        </div>
      </div>

      {/* Bottom Cream Section */}
      <div className="bg-orange-50 p-6">
        {/* Title */}
        <h3 className="text-gray-800 font-bold text-lg mb-3 line-clamp-2">
          {courtCase.caseTitle}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {courtCase.description || `Case filed on ${formatDate(courtCase.dateFiled)} regarding ${courtCase.caseType || 'legal proceedings'}. Court: ${courtCase.courtName || 'District Court'}. Judge: ${courtCase.judgeName || 'Hon. Justice'}...`}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button 
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2"
            onClick={() => {
              // Show more details or open modal
              if (onEdit && showActions) {
                onEdit(courtCase);
              }
            }}
          >
            Know More
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Admin Actions */}
          {showActions && (
            <div className="flex gap-2">
              {courtCase.pdfFileUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownload?.(courtCase)}
                  className="text-gray-600 hover:text-orange-600 h-8 w-8 p-0"
                  title="Download PDF"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              )}
              
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(courtCase)}
                  className="text-gray-600 hover:text-orange-600 h-8 w-8 p-0"
                  title="Edit Case"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(courtCase.id)}
                  className="text-gray-600 hover:text-red-600 h-8 w-8 p-0"
                  title="Delete Case"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Case Details */}
        <div className="mt-4 pt-4 border-t border-orange-200">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div>Case #: {courtCase.caseNumber}</div>
            <div>Priority: {courtCase.priority}</div>
            <div>Filed: {formatDate(courtCase.dateFiled)}</div>
            <div>Status: {courtCase.status}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CourtCases() {
  const { user, isAdmin, logout, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // State for filters and pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [district, setDistrict] = useState('all');
  const [caseStudy, setCaseStudy] = useState('all');

  // State for modals
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState<CourtCase | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // Fetch court cases
  const {
    data: courtCasesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courtCases', page, limit, search, status],
    queryFn: () =>
      firebaseApi.getCourtCases({
        page,
        limit,
        search: search || undefined,
        status: status !== 'all' ? status : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    refetchInterval: 30000,
  });

  // Create court case mutation
  const createMutation = useMutation({
    mutationFn: ({ data, file }: { data: CourtCaseFormData; file?: File }) =>
      firebaseApi.createCourtCase(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courtCases'] });
      setShowForm(false);
      toast.success('Court case created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create court case');
    },
  });

  // Update court case mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
      file,
    }: {
      id: string;
      data: CourtCaseFormData;
      file?: File;
    }) => firebaseApi.updateCourtCase(id, data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courtCases'] });
      setShowForm(false);
      setEditingCase(null);
      toast.success('Court case updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update court case');
    },
  });

  // Delete court case mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => firebaseApi.deleteCourtCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courtCases'] });
      toast.success('Court case deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete court case');
    },
  });

  const handleFormSubmit = async (data: CourtCaseFormData, file?: File) => {
    if (editingCase) {
      await updateMutation.mutateAsync({ id: editingCase.id, data, file });
    } else {
      await createMutation.mutateAsync({ data, file });
    }
  };

  const handleEdit = (courtCase: CourtCase) => {
    setEditingCase(courtCase);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this court case?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = (courtCase: CourtCase) => {
    if (courtCase.pdfFileUrl) {
      window.open(courtCase.pdfFileUrl, '_blank');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCase(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header matching the reference */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-orange-600">SaveDeities</h1>
                  <p className="text-sm text-gray-600">देवा: सत्य: हरिदेवा:</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-orange-600">Home</Link>
              <div className="text-gray-700 hover:text-orange-600">Our Seva</div>
              <div className="text-orange-600 font-medium">Media Centre</div>
              <div className="text-gray-700 hover:text-orange-600">About Us</div>
              <div className="text-gray-700 hover:text-orange-600">Contact Us</div>
              <div className="text-gray-700 hover:text-orange-600">Contribute</div>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                    {isAdmin && (
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                        Admin
                      </span>
                    )}
                  </div>
                  <Button variant="outline" onClick={logout} size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => setShowLogin(true)} size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Admin Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-orange-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-sm text-gray-600">
            <Home className="h-4 w-4 mr-2" />
            <Link to="/" className="hover:text-orange-600">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-600">Media Centre</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-orange-600 font-medium">Court Cases</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Court Cases</h1>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose State</label>
            <Select value="all" onValueChange={() => {}}>
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="delhi">Kerala</SelectItem>
                 
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose District</label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger>
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                 
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Case Studies</label>
            <Select value={caseStudy} onValueChange={setCaseStudy}>
              <SelectTrigger>
                <SelectValue placeholder="All Case Studies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Case Studies</SelectItem>
                <SelectItem value="heritage">Completed</SelectItem>
                <SelectItem value="land">In Court</SelectItem>
                <SelectItem value="religious">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="flex items-end">
              <Button 
                onClick={() => setShowForm(true)} 
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Case
              </Button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Failed to load court cases. Please try again.
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        )}

        {/* Court Cases Grid */}
        {courtCasesData && (
          <>
            {courtCasesData.cases.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No court cases found
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by adding your first court case
                </p>
                {isAdmin && (
                  <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Case
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {courtCasesData.cases.map((courtCase) => (
                    <CourtCaseCardNew
                      key={courtCase.id}
                      courtCase={courtCase}
                      onEdit={isAdmin ? handleEdit : undefined}
                      onDelete={isAdmin ? handleDelete : undefined}
                      onDownload={handleDownload}
                      showActions={isAdmin}
                    />
                  ))}
                </div>

                {/* Simple Pagination */}
                {courtCasesData.pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-600">
                      Page {page} of {courtCasesData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={page === courtCasesData.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCase ? 'Edit Court Case' : 'Add New Court Case'}
            </DialogTitle>
          </DialogHeader>
          <CourtCaseForm
            courtCase={editingCase || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="max-w-md">
          <LoginForm onSuccess={() => setShowLogin(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}