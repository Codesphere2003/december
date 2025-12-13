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
  description: z.string().optional(),
  dateFiled: z.string().min(1, 'Date filed is required'),
  status: z.string().min(1, 'Status is required'),
});

interface CourtCaseFormProps {
  courtCase?: CourtCase;
  onSubmit: (data: CourtCaseFormData, imageFile?: File) => Promise<void>;
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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
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
      description: '',
      dateFiled: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (courtCase) {
      reset({
        caseTitle: courtCase.caseTitle,
        description: courtCase.description || '',
        dateFiled: courtCase.dateFiled,
        status: courtCase.status,
      });
    }
  }, [courtCase, reset]);

  const handleFormSubmit = async (data: CourtCaseFormData) => {
    try {
      setError('');
      await onSubmit(data, selectedImageFile || undefined);
    } catch (error: any) {
      setError(error.message || 'Failed to save court case');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setSelectedImageFile(file);
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
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setSelectedImageFile(file);
      setError('');
    }
  };

  const removeImageFile = () => {
    setSelectedImageFile(null);
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
                placeholder="Enter temple/case name"
                {...register('caseTitle')}
                disabled={isLoading}
              />
              {errors.caseTitle && (
                <p className="text-sm text-destructive">{errors.caseTitle.message}</p>
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

            <div className="space-y-2 md:col-span-2">
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
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Dismissed">In Court</SelectItem>
                  <SelectItem value="Settled">Settled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
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

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Temple Image</Label>
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
              {selectedImageFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{selectedImageFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeImageFile}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <img
                    src={URL.createObjectURL(selectedImageFile)}
                    alt="Preview"
                    className="mx-auto h-32 w-auto rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop an image here, or click to select
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={isLoading}
                  >
                    Select Image
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum file size: 5MB (JPG, PNG, WebP)
                  </p>
                </div>
              )}
            </div>
            {isEditing && courtCase?.imageName && !selectedImageFile && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Current image: {courtCase.imageName}
                </p>
                {courtCase.imageUrl && (
                  <img
                    src={courtCase.imageUrl}
                    alt="Current"
                    className="h-32 w-auto rounded-lg object-cover"
                  />
                )}
              </div>
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