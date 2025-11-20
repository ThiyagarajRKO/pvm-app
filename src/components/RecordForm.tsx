'use client';

import React, { useState } from 'react';
import { Loader2, Upload, X, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Card removed: groups now have their own container wrappers
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PlaceSelect from '@/components/PlaceSelect';
import StreetSelect from '@/components/StreetSelect';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api-client';
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
      } else {
        setItemImageUrl(publicUrl);
        setItemUploading(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      if (type === 'person') {
        setPersonError(errorMessage);
        setPersonUploading(false);
      } else {
        setItemError(errorMessage);
        setItemUploading(false);
      }
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
    } else {
      setItemPreview(previewUrl);
      setItemError(null);
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

    // Delete from server if uploaded
    if (imageUrl) {
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
      // Reset file input
      const input = document.getElementById(
        'personImageInput'
      ) as HTMLInputElement;
      if (input) input.value = '';
    } else {
      setItemImageUrl(null);
      setItemPreview(null);
      setItemError(null);
      // Reset file input
      const input = document.getElementById(
        'itemImageInput'
      ) as HTMLInputElement;
      if (input) input.value = '';
    }
  };
  const schema = isEdit ? recordUpdateSchema : recordCreateSchema;
  const form = useForm<RecordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      slNo: initialData?.slNo || '',
      name: initialData?.name || '',
      fatherName: initialData?.fatherName || '',
      street: initialData?.street || '',
      place: initialData?.place || '',
      weightGrams: initialData?.weightGrams,
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
    }
    if (initialData?.itemImageUrl) {
      setItemImageUrl(initialData.itemImageUrl);
      setItemPreview(initialData.itemImageUrl);
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
      if (response.error) throw new Error(response.error);
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
                className={`grid grid-cols-1 gap-4 ${compact ? '' : 'md:grid-cols-2'}`}
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
                          {...field}
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
                    <FormItem>
                      <FormLabel className="text-foreground">Mobile</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 10-digit mobile number"
                          value={field.value}
                          onChange={(e) => {
                            // Strip non-digits and limit to 10 characters
                            const digits = e.target.value
                              .replace(/\D/g, '')
                              .slice(0, 10);
                            field.onChange(digits);
                            // Trigger validation for this field so FormMessage updates live
                            form.trigger('mobile');
                          }}
                          maxLength={10}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className={
                            fieldState.error ? 'border-destructive' : ''
                          }
                        />
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
                        <StreetSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          contentClassName="max-h-[300px]"
                          triggerClassName={
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
                        <PlaceSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          contentClassName="max-h-[300px]"
                          triggerClassName={
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
                  name="weightGrams"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Weight (grams)
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
                                ? undefined
                                : parseFloat(e.target.value)
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
                  name="itemType"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Item Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={
                              fieldState.error ? 'border-destructive' : ''
                            }
                          >
                            <SelectValue placeholder="Select item type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Gold">Gold</SelectItem>
                          <SelectItem value="Silver">Silver</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
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
                                ? undefined
                                : parseInt(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch('amount') && form.watch('amount') > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Interest Rate:{' '}
                  <span className="font-medium">
                    {form.watch('amount') >= 1000 ? '2.5%' : '3%'}
                  </span>
                </p>
              )}
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
                      />

                      {/* Loading overlay */}
                      {personUploading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}

                      {/* Delete button */}
                      {(personImageUrl || personPreview) &&
                        !personUploading && (
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
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-xs">{personError}</p>
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
                      />

                      {/* Loading overlay */}
                      {itemUploading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}

                      {/* Delete button */}
                      {(itemImageUrl || itemPreview) && !itemUploading && (
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
                    <div className="mt-2 flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-xs">{itemError}</p>
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
              onClick={() => (onCancel ? onCancel() : router.back())}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting
                ? 'Saving...'
                : isEdit
                  ? 'Update Record'
                  : 'Save Record'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Delete Image Confirmation Dialog */}
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
    </div>
  );
}
