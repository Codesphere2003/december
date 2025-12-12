import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  User, 
  Building, 
  Gavel,
  AlertCircle
} from 'lucide-react';
import { CourtCase } from '@/types/courtCase';
import { format } from 'date-fns';

interface CourtCaseCardProps {
  courtCase: CourtCase;
  onEdit?: (courtCase: CourtCase) => void;
  onDelete?: (id: string) => void;
  onDownload?: (courtCase: CourtCase) => void;
  showActions?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'dismissed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
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

export const CourtCaseCard: React.FC<CourtCaseCardProps> = ({
  courtCase,
  onEdit,
  onDelete,
  onDownload,
  showActions = false,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {courtCase.caseTitle}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono text-xs">
                {courtCase.caseNumber}
              </Badge>
              <Badge className={getStatusColor(courtCase.status)}>
                {courtCase.status}
              </Badge>
              <Badge className={getPriorityColor(courtCase.priority)}>
                {courtCase.priority} Priority
              </Badge>
            </div>
          </div>
          {showActions && (
            <div className="flex gap-1 ml-4">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(courtCase)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(courtCase.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {courtCase.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {courtCase.description}
          </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Filed:</span>
            <span className="font-medium">{formatDate(courtCase.dateFiled)}</span>
          </div>
          
          {courtCase.courtName && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Court:</span>
              <span className="font-medium truncate">{courtCase.courtName}</span>
            </div>
          )}
          
          {courtCase.judgeName && (
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Judge:</span>
              <span className="font-medium truncate">{courtCase.judgeName}</span>
            </div>
          )}
          
          {courtCase.caseType && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{courtCase.caseType}</span>
            </div>
          )}
          
          {courtCase.plaintiff && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Plaintiff:</span>
              <span className="font-medium truncate">{courtCase.plaintiff}</span>
            </div>
          )}
          
          {courtCase.defendant && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Defendant:</span>
              <span className="font-medium truncate">{courtCase.defendant}</span>
            </div>
          )}
        </div>
        
        {courtCase.pdfFileUrl && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {courtCase.pdfFileName || 'Court Document'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload?.(courtCase)}
                className="h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};