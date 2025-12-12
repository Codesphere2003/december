import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X } from 'lucide-react';
import { CourtCase, CourtCaseFormData } from '@/types/courtCase';

const courtCaseSchema = z.object({
  caseTitle: z.string().min(1, 'Case title is required'),
  caseNumber: z.string().min(1, 'Case number is required'),
  description: z.string().optional(),
  dateFiled: z.string().min(1, 'Date filed is required'),
  status: z.string().min(1, 'Status is required'),
  courtName: z.string().optional(),
  judgeName: z.string().optional(),
  plaintiff: z.string().optional(),
  defendant: z.string().optional(),
  caseType: z.string().optional(),
  priority: z.string().min(1, 'Priority is required'),
});

interface CourtCaseFormProps {
  courtCase?: CourtCase;
  onSubmit: (data: CourtCaseFormData, file?: File) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CourtCaseForm: React.FC<CourtCaseFormProps> = ({
  courtCase,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const isEditing = !!courtCase;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CourtCaseFormData>({
    resolver: zodResolver(courtCaseSchema),
    defaultValues: {
      caseTitle: '',
      caseNumber: '',
      description: '',
      dateFiled: '',
      status: 'Active',
      courtName: '',
      judgeName: '',
      plaintiff: '',
      defendant: '',
      caseType: '',
      priority: 'Medium',
    },
  });

  useEffect(() => {
    if (courtCase) {
      reset({
        caseTitle: courtCase.caseTitle,
        caseNumber: courtCase.caseNumber,
        description: courtCase.description || '',
        dateFiled: courtCase.dateFiled,
        status: courtCase.status,
        courtName: courtCase.courtName || '',
        judgeName: courtCase.judgeName || '',
        plaintiff: courtCase.plaintiff || '',
        defendant: courtCase.defendant || '',
        caseType: courtCase.caseType || '',
        priority: courtCase.priority,
      });
    }
  }, [courtCase, reset]);

  const handleFormSubmit = async (data: CourtCaseFormData) => {
    try {
      setError('');
      await onSubmit(data, selectedFile || undefined);
    } catch (error: any) {
      setError(error.message || 'Failed to save court case');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Court Case' : 'Add New Court Case'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update the court case information' : 'Enter the details for the new court case'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caseTitle">Case Title *</Label>
              <Input
                id="caseTitle"
                placeholder="Enter case title"
                {...register('caseTitle')}
                disabled={isLoading}
              />
              {errors.caseTitle && (
                <p className="text-sm text-destructive">{errors.caseTitle.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseNumber">Case Number *</Label>
              <Input
                id="caseNumber"
                placeholder="Enter case number"
                {...register('caseNumber')}
                disabled={isLoading}
              />
              {errors.caseNumber && (
                <p className="text-sm text-destructive">{errors.caseNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFiled">Date Filed *</Label>
              <Input
                id="dateFiled"
                type="date"
                {...register('dateFiled')}
                disabled={isLoading}
              />
              {errors.dateFiled && (
                <p className="text-sm text-destructive">{errors.dateFiled.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Dismissed">Dismissed</SelectItem>
                  <SelectItem value="Settled">Settled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">{errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseType">Case Type</Label>
              <Input
                id="caseType"
                placeholder="e.g., Civil, Criminal, Family"
                {...register('caseType')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courtName">Court Name</Label>
              <Input
                id="courtName"
                placeholder="Enter court name"
                {...register('courtName')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="judgeName">Judge Name</Label>
              <Input
                id="judgeName"
                placeholder="Enter judge name"
                {...register('judgeName')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plaintiff">Plaintiff</Label>
              <Input
                id="plaintiff"
                placeholder="Enter plaintiff name"
                {...register('plaintiff')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defendant">Defendant</Label>
              <Input
                id="defendant"
                placeholder="Enter defendant name"
                {...register('defendant')}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter case description"
              rows={4}
              {...register('description')}
              disabled={isLoading}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>PDF Document</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop a PDF file here, or click to select
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isLoading}
                  >
                    Select PDF File
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum file size: 10MB
                  </p>
                </div>
              )}
            </div>
            {isEditing && courtCase?.pdfFileName && !selectedFile && (
              <p className="text-sm text-gray-600">
                Current file: {courtCase.pdfFileName}
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Case' : 'Create Case'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};