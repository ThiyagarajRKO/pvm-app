'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  Upload,
  X,
  Eye,
  AlertCircle,
  Search,
  Check,
  User,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Card removed: groups now have their own container wrappers
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AutocompleteInput from '@/components/AutocompleteInput';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api-client';
import {
  DEFAULT_STREETS,
  DEFAULT_PLACES,
  DEFAULT_ITEMS,
} from '@/lib/constants';
import SimpleMobileConfirmation from './SimpleMobileConfirmation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import {
  recordCreateSchema,
  recordUpdateSchema,
} from '@/lib/validators/record';
import { format } from 'date-fns';
import { useDebouncedCallback } from '../hooks/use-debounce';

type RecordFormData = z.infer<typeof recordCreateSchema>;

interface RecordFormProps {
  initialData?: Partial<RecordFormData>;
  isEdit?: boolean;
  recordId?: string;
  compact?: boolean;
  isMobile?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
  defaultCategory?: 'active' | 'archived' | 'big';
}

// Component for suggestion avatars with async loading
function SuggestionAvatar({ src, alt }: { src?: string; alt: string }) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(!!src);

  React.useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setImageLoaded(false);
      setImageError(false);
      return;
    }

    setIsLoading(true);
    setImageError(false);

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageError(true);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  if (!src || imageError) {
    return <User className="h-4 w-4 text-gray-400" />;
  }

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
  }

  if (imageLoaded) {
    return (
      <img src={src} alt={alt} className="h-8 w-8 rounded-full object-cover" />
    );
  }

  return <User className="h-4 w-4 text-gray-400" />;
}

export default function RecordForm({
  initialData,
  isEdit = false,
  recordId,
  compact = false,
  isMobile = false,
  onCancel,
  onSuccess,
  defaultCategory = 'active',
}: RecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image upload states
  const [personImageUrl, setPersonImageUrl] = useState<string | null>(null);
  const [itemImageUrl, setItemImageUrl] = useState<string | null>(null);
  const [personUploading, setPersonUploading] = useState(false);
  const [itemUploading, setItemUploading] = useState(false);
  const [personError, setPersonError] = useState<string | null>(null);
  const [itemError, setItemError] = useState<string | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [itemPreview, setItemPreview] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<'person' | 'item' | null>(
    null
  );
  const [personImagePrefilled, setPersonImagePrefilled] = useState(false);

  // Image loading states
  const [personImageLoading, setPersonImageLoading] = useState(false);
  const [itemImageLoading, setItemImageLoading] = useState(false);

  // Toggle body class for dialog state (only for mobile)
  React.useEffect(() => {
    if (isMobile && deleteDialogOpen) {
      document.body.classList.add('alert-dialog-open');
    } else {
      document.body.classList.remove('alert-dialog-open');
    }

    return () => {
      document.body.classList.remove('alert-dialog-open');
    };
  }, [deleteDialogOpen, isMobile]);

  // Failed upload retry states
  const [personFailedFile, setPersonFailedFile] = useState<File | null>(null);
  const [itemFailedFile, setItemFailedFile] = useState<File | null>(null);

  // Mobile search states
  const [mobileSuggestions, setMobileSuggestions] = useState<any[]>([]);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [isSearchingMobile, setIsSearchingMobile] = useState(false);

  const router = useRouter();

  // Image upload functions
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Supported types: ${allowedTypes.join(', ')}`;
    }
    if (file.size > maxSize) {
      return `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum 5MB`;
    }
    return null;
  };

  const uploadImage = async (
    file: File,
    type: 'person' | 'item'
  ): Promise<void> => {
    try {
      if (type === 'person') {
        setPersonUploading(true);
        setPersonError(null);
      } else {
        setItemUploading(true);
        setItemError(null);
      }

      // Get presigned URL
      const presignResponse = await api.post('/s3/presign', {
        fileName: file.name,
        contentType: file.type,
        folder: 'pawn-records',
      });
      if (presignResponse.error) throw new Error(presignResponse.error);
      const { uploadUrl, publicUrl } = presignResponse.data;

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Set the uploaded URL
      if (type === 'person') {
        setPersonImageUrl(publicUrl);
        setPersonUploading(false);
        setPersonImagePrefilled(false); // Reset prefilled flag when new image is uploaded
        setPersonFailedFile(null); // Clear failed file on success
      } else {
        setItemImageUrl(publicUrl);
        setItemUploading(false);
        setItemFailedFile(null); // Clear failed file on success
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      if (type === 'person') {
        setPersonError(errorMessage);
        setPersonUploading(false);
        setPersonFailedFile(file); // Store failed file for retry
      } else {
        setItemError(errorMessage);
        setItemUploading(false);
        setItemFailedFile(file); // Store failed file for retry
      }
    }
  };

  const retryUpload = (type: 'person' | 'item') => {
    const failedFile = type === 'person' ? personFailedFile : itemFailedFile;
    if (failedFile) {
      uploadImage(failedFile, type);
    }
  };

  const handleFileSelect = (file: File | null, type: 'person' | 'item') => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      if (type === 'person') {
        setPersonError(validationError);
      } else {
        setItemError(validationError);
      }
      // Reset file input on validation error
      const input = document.getElementById(
        `${type}ImageInput`
      ) as HTMLInputElement;
      if (input) input.value = '';
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    if (type === 'person') {
      setPersonPreview(previewUrl);
      setPersonError(null);
      setPersonFailedFile(null); // Clear any previous failed file
    } else {
      setItemPreview(previewUrl);
      setItemError(null);
      setItemFailedFile(null); // Clear any previous failed file
    }

    // Reset file input to allow re-selection of same file
    const input = document.getElementById(
      `${type}ImageInput`
    ) as HTMLInputElement;
    if (input) input.value = '';

    uploadImage(file, type);
  };

  const confirmDeleteImage = (type: 'person' | 'item') => {
    setImageToDelete(type);
    setDeleteDialogOpen(true);
  };

  const removeImage = async (type: 'person' | 'item') => {
    const imageUrl = type === 'person' ? personImageUrl : itemImageUrl;
    const previewUrl = type === 'person' ? personPreview : itemPreview;

    if (!imageUrl && !previewUrl) return;

    // Clean up preview URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // Delete from server if uploaded (but not if prefilled from suggestion)
    if (imageUrl && !(type === 'person' && personImagePrefilled)) {
      try {
        const url = new URL(imageUrl);
        const key = url.pathname.substring(1); // Remove leading slash
        await api.post('/s3/delete', { key });
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }

    // Clear local state
    if (type === 'person') {
      setPersonImageUrl(null);
      setPersonPreview(null);
      setPersonError(null);
      setPersonImagePrefilled(false); // Reset prefilled flag
      setPersonFailedFile(null); // Clear failed file
      setPersonImageLoading(false); // Reset loading state
      // Reset file input
      const input = document.getElementById(
        'personImageInput'
      ) as HTMLInputElement;
      if (input) input.value = '';
    } else {
      setItemImageUrl(null);
      setItemPreview(null);
      setItemError(null);
      setItemFailedFile(null); // Clear failed file
      setItemImageLoading(false); // Reset loading state
      // Reset file input
      const input = document.getElementById(
        'itemImageInput'
      ) as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  // Mobile search functionality
  const searchMobileNumbers = useCallback(async (mobile: string) => {
    if (mobile.length < 3) {
      setMobileSuggestions([]);
      setShowMobileSuggestions(false);
      return;
    }

    try {
      setIsSearchingMobile(true);
      const response = await api.get(
        `/records/mobile?mobile=${encodeURIComponent(mobile)}`
      );

      if (response.data && Array.isArray(response.data.data)) {
        // The API returns an array of up to 10 matching records
        setMobileSuggestions(response.data.data);
        setShowMobileSuggestions(response.data.data.length > 0);
      }
    } catch (error) {
      console.error('Error searching mobile numbers:', error);
      setMobileSuggestions([]);
      setShowMobileSuggestions(false);
    } finally {
      setIsSearchingMobile(false);
    }
  }, []);

  const debouncedMobileSearch = useDebouncedCallback(searchMobileNumbers, 300);

  const handleMobileSuggestionSelect = (record: any) => {
    // Clean and format the mobile number (strip non-digits and limit to 10)
    const cleanMobile = (record.mobile || '').replace(/\D/g, '').slice(0, 10);

    // Fill in personal details from the selected record
    form.setValue('name', record.name || '');
    form.setValue('fatherName', record.fatherName || '');
    form.setValue('street', record.street || '');
    form.setValue('place', record.place || '');
    form.setValue('mobile', cleanMobile);

    // Set person image if available from the selected record
    if (record.personImageUrl) {
      setPersonImageUrl(record.personImageUrl);
      setPersonPreview(record.personImageUrl);
      setPersonImagePrefilled(true);
      setPersonImageLoading(true); // Start loading when URL is set from suggestion
    }

    // Trigger validation for all updated fields
    form.trigger(['mobile', 'name', 'fatherName', 'street', 'place']);

    // Hide suggestions
    setShowMobileSuggestions(false);
    setMobileSuggestions([]);
  };

  const schema = isEdit ? recordUpdateSchema : recordCreateSchema;
  const form = useForm<RecordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      slNo: initialData?.slNo || '',
      date: initialData?.date || new Date().toISOString().split('T')[0], // Default to today for new records
      name: initialData?.name || '',
      fatherName: initialData?.fatherName || '',
      street: initialData?.street || '',
      place: initialData?.place || '',
      item: initialData?.item || '',
      goldWeightGrams: initialData?.goldWeightGrams,
      silverWeightGrams: initialData?.silverWeightGrams,
      itemType: initialData?.itemType || 'Gold',
      amount: initialData?.amount,
      mobile: initialData?.mobile || '',
      personImageUrl: initialData?.personImageUrl,
      itemImageUrl: initialData?.itemImageUrl,
      itemCategory: initialData?.itemCategory || defaultCategory,
    },
  });

  // Set initial uploaded URLs
  React.useEffect(() => {
    if (initialData?.personImageUrl) {
      setPersonImageUrl(initialData.personImageUrl);
      setPersonPreview(initialData.personImageUrl);
      setPersonImagePrefilled(true); // Mark as prefilled for edit mode
      setPersonImageLoading(true); // Start loading when URL is set
    }
    if (initialData?.itemImageUrl) {
      setItemImageUrl(initialData.itemImageUrl);
      setItemPreview(initialData.itemImageUrl);
      setItemImageLoading(true); // Start loading when URL is set
    }
  }, [initialData]);

  const onSubmit = async (data: RecordFormData) => {
    setIsSubmitting(true);
    try {
      const recordData = {
        ...data,
        personImageUrl: personImageUrl || undefined,
        itemImageUrl: itemImageUrl || undefined,
      };

      const url = isEdit ? `/records/${recordId}` : '/records';
      const method = isEdit ? 'PUT' : 'POST';

      const response =
        method === 'POST'
          ? await api.post(url, recordData)
          : await api.put(url, recordData);

      if (response.error) {
        // Handle validation errors specifically
        if (response.error === 'validation' && response.data?.issues) {
          const issues = response.data.issues;
          // Set form errors for each validation issue
          issues.forEach((issue: any) => {
            if (issue.path && issue.path.length > 0) {
              const fieldName = issue.path[0];
              form.setError(fieldName, {
                type: 'server',
                message: issue.message,
              });
            }
          });
          // Show specific error messages in toast
          const errorMessages = issues
            .map((issue: any) => issue.message)
            .join(', ');
          toast.warning(errorMessages);
          return;
        }
        // For other errors, throw to show generic error
        throw new Error(response.error);
      }

      // close sheet if onCancel is provided (mobile) or navigate back on desktop
      if (onCancel) onCancel();
      else router.push('/records/active');

      toast.success(isEdit ? 'Record updated' : 'Record created');
      onSuccess?.();
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <fieldset className="space-y-1">
            <legend className="text-sm font-semibold">
              Personal Information
            </legend>
            <div className="rounded-lg border bg-card p-4">
              <div
                className={`grid grid-cols-1 gap-4 ${compact ? '' : 'md:grid-cols-3'}`}
              >
                <FormField
                  control={form.control}
                  name="slNo"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">SL No</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter serial number"
                          className={
                            fieldState.error ? 'border-destructive' : ''
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field, fieldState }) => (
                    <FormItem
                      className={`relative ${!compact ? 'md:col-span-2' : ''}`}
                    >
                      <FormLabel className="text-foreground">Mobile</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter 10-digit mobile number"
                            value={field.value}
                            onChange={(e) => {
                              // Strip non-digits and limit to 10 characters
                              const digits = e.target.value
                                .replace(/\D/g, '')
                                .slice(0, 10);
                              field.onChange(digits === '' ? null : digits);
                              // Trigger search for suggestions
                              if (digits.length >= 3) {
                                debouncedMobileSearch(digits);
                              } else {
                                setMobileSuggestions([]);
                                setShowMobileSuggestions(false);
                              }
                              // Trigger validation for this field so FormMessage updates live
                              form.trigger('mobile');
                            }}
                            onFocus={() => {
                              if (mobileSuggestions.length > 0) {
                                setShowMobileSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              // Delay hiding to allow click on suggestions
                              setTimeout(
                                () => setShowMobileSuggestions(false),
                                200
                              );
                            }}
                            maxLength={10}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className={
                              fieldState.error ? 'border-destructive' : ''
                            }
                          />
                          {isSearchingMobile && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            </div>
                          )}
                          {/* Mobile Suggestions Dropdown */}
                          {showMobileSuggestions &&
                            mobileSuggestions.length > 0 && (
                              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border bg-white shadow-lg">
                                {mobileSuggestions.map((record) => (
                                  <button
                                    key={record.id}
                                    type="button"
                                    onClick={() =>
                                      handleMobileSuggestionSelect(record)
                                    }
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                  >
                                    {/* Avatar */}
                                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                                      <SuggestionAvatar
                                        src={record.personImageUrl}
                                        alt={record.name || 'Person'}
                                      />
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0 flex-1">
                                      <div className="truncate text-sm font-medium text-gray-900">
                                        {record.name}
                                      </div>
                                      <div className="truncate text-xs text-gray-500">
                                        {record.mobile} • {record.place}
                                      </div>
                                    </div>

                                    {/* Check icon */}
                                    <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
                      </FormControl>
                      {/* Live inline hint/error while typing */}
                      {field.value && field.value.length !== 10 && (
                        <p className="mt-1 text-xs text-destructive">
                          Mobile must be 10 digits
                        </p>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field, fieldState }) => {
                    const displayValue = field.value
                      ? format(new Date(field.value), 'dd-MMM-yyyy')
                      : '';

                    return (
                      <FormItem>
                        <FormLabel className="text-foreground">Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="date"
                              value={field.value || ''}
                              placeholder="Select date"
                              className={`${
                                fieldState.error ? 'border-destructive' : ''
                              } cursor-pointer pr-10 [&::-moz-focus-inner]:border-0 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === '' ? null : e.target.value
                                )
                              }
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 touch-manipulation items-center justify-center rounded-md bg-transparent p-2 transition-colors hover:bg-muted active:bg-muted"
                              onClick={(e) => {
                                e.preventDefault();
                                const input = e.currentTarget
                                  .previousElementSibling as HTMLInputElement;
                                if (input?.showPicker) {
                                  input.showPicker();
                                } else {
                                  input?.focus();
                                  input?.click();
                                }
                              }}
                            >
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    );
                  }}
                />{' '}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter full name"
                          className={
                            fieldState.error ? 'border-destructive' : ''
                          }
                          value={field.value || ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? null : e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Father Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter father's name"
                          className={
                            fieldState.error ? 'border-destructive' : ''
                          }
                          value={field.value || ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? null : e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-1">
            <legend className="text-sm font-semibold">Address</legend>
            <div className="rounded-lg border bg-card p-4">
              <div
                className={`grid grid-cols-1 gap-4 ${compact ? '' : 'md:grid-cols-2'}`}
              >
                {/* Street and place */}
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Street</FormLabel>
                      <FormControl>
                        <AutocompleteInput
                          value={field.value || ''}
                          onValueChange={(value) =>
                            field.onChange(value === '' ? null : value)
                          }
                          placeholder="Enter street name"
                          suggestions={DEFAULT_STREETS}
                          className={
                            fieldState.error ? 'border-destructive' : ''
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="place"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Place</FormLabel>
                      <FormControl>
                        <AutocompleteInput
                          value={field.value || ''}
                          onValueChange={(value) =>
                            field.onChange(value === '' ? null : value)
                          }
                          placeholder="Enter place name"
                          suggestions={DEFAULT_PLACES}
                          className={
                            fieldState.error ? 'border-destructive' : ''
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-1">
            <legend className="text-sm font-semibold">Item Details</legend>
            <div className="rounded-lg border bg-card p-4">
              <div
                className={`grid grid-cols-1 gap-4 ${compact ? '' : 'md:grid-cols-3'}`}
              >
                <FormField
                  control={form.control}
                  name="itemType"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Item Type
                      </FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {[
                          {
                            type: 'Gold',
                            icon: '🥇',
                            color: 'bg-yellow-300',
                            hoverColor: 'hover:bg-yellow-400',
                          },
                          {
                            type: 'Silver',
                            icon: '🥈',
                            color: 'bg-gray-300',
                            hoverColor: 'hover:bg-gray-400',
                          },
                          {
                            type: 'Both',
                            icon: '🥇🥈',
                            color:
                              'bg-gradient-to-r from-yellow-300 to-gray-300',
                            hoverColor:
                              'hover:from-yellow-400 hover:to-gray-400',
                          },
                        ].map(({ type, icon, color, hoverColor }) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => field.onChange(type)}
                            className={`flex min-w-0 flex-shrink-0 items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 transition-all duration-200 ${
                              field.value === type
                                ? `${color} border-transparent text-white shadow-md`
                                : `border-gray-300 bg-white text-gray-700 ${hoverColor} hover:text-white hover:shadow-sm`
                            } ${fieldState.error ? 'border-red-300' : ''}`}
                          >
                            <span className="text-base">{icon}</span>
                            <span className="whitespace-nowrap text-xs font-medium text-black">
                              {type}
                            </span>
                          </button>
                        ))}
                      </div>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="item"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Item</FormLabel>
                      <FormControl>
                        <AutocompleteInput
                          value={field.value || ''}
                          onValueChange={(value) =>
                            field.onChange(value === '' ? null : value)
                          }
                          placeholder="Enter item name (e.g., Ring, Necklace)"
                          suggestions={DEFAULT_ITEMS}
                          className={
                            fieldState.error ? 'border-destructive' : ''
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                {(form.watch('itemType') === 'Gold' ||
                  form.watch('itemType') === 'Both') && (
                  <FormField
                    control={form.control}
                    name="goldWeightGrams"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Gold Weight (grams)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className={
                              fieldState.error ? 'border-destructive' : ''
                            }
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? null
                                  : parseFloat(e.target.value)
                              )
                            }
                            onWheel={(e) => e.currentTarget.blur()}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}
                {(form.watch('itemType') === 'Silver' ||
                  form.watch('itemType') === 'Both') && (
                  <FormField
                    control={form.control}
                    name="silverWeightGrams"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Silver Weight (grams)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className={
                              fieldState.error ? 'border-destructive' : ''
                            }
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? null
                                  : parseFloat(e.target.value)
                              )
                            }
                            onWheel={(e) => e.currentTarget.blur()}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1200"
                          className={
                            fieldState.error ? 'border-destructive' : ''
                          }
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? null
                                : parseInt(e.target.value)
                            )
                          }
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {(() => {
                const amount = form.watch('amount');
                return (
                  amount &&
                  amount > 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Interest Rate:{' '}
                      <span className="font-medium">
                        {amount >= 10000 ? '2.5%' : '3%'}
                      </span>
                    </p>
                  )
                );
              })()}
            </div>
          </fieldset>

          <fieldset className="space-y-1">
            <legend className="text-sm font-semibold">Images</legend>
            <div className="rounded-lg border bg-card p-4">
              <div
                className={`grid grid-cols-1 gap-4 ${compact ? '' : 'md:grid-cols-2'}`}
              >
                {/* Person Image */}
                <div>
                  <Label className="text-sm font-medium">Person Image</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isEdit
                      ? 'Upload new image to replace current one'
                      : 'Upload person image'}
                  </p>

                  {/* Upload Area */}
                  {!personImageUrl && !personUploading && (
                    <div
                      className="mt-2 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-gray-400"
                      onClick={() =>
                        document.getElementById('personImageInput')?.click()
                      }
                    >
                      <Upload className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                      <p className="text-xs text-gray-600">
                        Click to upload person image
                      </p>
                      <p className="text-xs text-gray-500">
                        JPEG, PNG, WebP • Max 5MB
                      </p>
                    </div>
                  )}

                  {/* Preview */}
                  {(personImageUrl || personPreview || personUploading) && (
                    <div className="relative mt-2 inline-block">
                      <img
                        src={personImageUrl || personPreview || undefined}
                        alt="Person"
                        className="max-h-32 max-w-full rounded-lg border object-contain"
                        onLoad={() => setPersonImageLoading(false)}
                        onError={() => setPersonImageLoading(false)}
                      />

                      {/* Loading overlay */}
                      {(personUploading || personImageLoading) && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}

                      {/* Delete button */}
                      {(personImageUrl || personPreview) &&
                        !personUploading &&
                        !personImageLoading && (
                          <button
                            type="button"
                            onClick={() => confirmDeleteImage('person')}
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                    </div>
                  )}

                  {/* Error */}
                  {personError && (
                    <div className="mt-2 flex items-center justify-between gap-2 text-red-600">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-xs">{personError}</p>
                      </div>
                      {personFailedFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => retryUpload('person')}
                          className="h-6 px-2 text-xs"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  )}

                  <input
                    id="personImageInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileSelect(e.target.files?.[0] || null, 'person')
                    }
                    className="hidden"
                  />
                </div>

                {/* Item Image */}
                <div>
                  <Label className="text-sm font-medium">Item Image</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isEdit
                      ? 'Upload new image to replace current one'
                      : 'Upload item image'}
                  </p>

                  {/* Upload Area */}
                  {!itemImageUrl && !itemUploading && (
                    <div
                      className="mt-2 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-gray-400"
                      onClick={() =>
                        document.getElementById('itemImageInput')?.click()
                      }
                    >
                      <Upload className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                      <p className="text-xs text-gray-600">
                        Click to upload item image
                      </p>
                      <p className="text-xs text-gray-500">
                        JPEG, PNG, WebP • Max 5MB
                      </p>
                    </div>
                  )}

                  {/* Preview */}
                  {(itemImageUrl || itemPreview || itemUploading) && (
                    <div className="relative mt-2 inline-block">
                      <img
                        src={itemImageUrl || itemPreview || undefined}
                        alt="Item"
                        className="max-h-32 max-w-full rounded-lg border object-contain"
                        onLoad={() => setItemImageLoading(false)}
                        onError={() => setItemImageLoading(false)}
                      />

                      {/* Loading overlay */}
                      {(itemUploading || itemImageLoading) && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}

                      {/* Delete button */}
                      {(itemImageUrl || itemPreview) &&
                        !itemUploading &&
                        !itemImageLoading && (
                          <button
                            type="button"
                            onClick={() => confirmDeleteImage('item')}
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                    </div>
                  )}

                  {/* Error */}
                  {itemError && (
                    <div className="mt-2 flex items-center justify-between gap-2 text-red-600">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-xs">{itemError}</p>
                      </div>
                      {itemFailedFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => retryUpload('item')}
                          className="h-6 px-2 text-xs"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  )}

                  <input
                    id="itemImageInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileSelect(e.target.files?.[0] || null, 'item')
                    }
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <div
            className={`flex ${isMobile ? 'justify-between' : 'justify-end'} gap-2`}
          >
            <Button
              type="button"
              variant={isMobile ? 'link' : 'outline'}
              disabled={
                personUploading ||
                itemUploading ||
                personImageLoading ||
                itemImageLoading
              }
              onClick={() => {
                if (
                  personUploading ||
                  itemUploading ||
                  personImageLoading ||
                  itemImageLoading
                ) {
                  toast.error(
                    'Please wait for image operations to complete before canceling'
                  );
                  return;
                }
                onCancel ? onCancel() : router.back();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                personUploading ||
                itemUploading ||
                personImageLoading ||
                itemImageLoading
              }
            >
              {(isSubmitting ||
                personUploading ||
                itemUploading ||
                personImageLoading ||
                itemImageLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {personUploading ||
              itemUploading ||
              personImageLoading ||
              itemImageLoading
                ? 'Loading...'
                : isSubmitting
                  ? 'Saving...'
                  : isEdit
                    ? 'Update Record'
                    : 'Save Record'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Delete Image Confirmation */}
      {isMobile ? (
        <SimpleMobileConfirmation
          isOpen={deleteDialogOpen}
          title="Delete Image"
          message={`Are you sure you want to delete this ${imageToDelete === 'person' ? 'person' : 'item'} image? This action cannot be undone.`}
          onConfirm={() => {
            if (imageToDelete) {
              removeImage(imageToDelete);
              setDeleteDialogOpen(false);
              setImageToDelete(null);
            }
          }}
          onCancel={() => setDeleteDialogOpen(false)}
          confirmText="Delete"
        />
      ) : (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <X className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <AlertDialogTitle>Delete Image</AlertDialogTitle>
                  <AlertDialogDescription className="mt-2">
                    Are you sure you want to delete this{' '}
                    {imageToDelete === 'person' ? 'person' : 'item'} image? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (imageToDelete) {
                    removeImage(imageToDelete);
                    setDeleteDialogOpen(false);
                    setImageToDelete(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <X className="mr-2 h-4 w-4" />
                Delete Image
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
