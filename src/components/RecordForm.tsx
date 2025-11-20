'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { uploadToS3 } from '@/lib/client-s3';
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
  const [personImageFile, setPersonImageFile] = useState<File | null>(null);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [personImagePreview, setPersonImagePreview] = useState<string | null>(
    null
  );
  const [itemImagePreview, setItemImagePreview] = useState<string | null>(null);
  React.useEffect(() => {
    let personUrl: string | undefined;
    if (personImageFile) {
      personUrl = URL.createObjectURL(personImageFile);
      setPersonImagePreview(personUrl);
    }
    return () => {
      if (personUrl) URL.revokeObjectURL(personUrl);
    };
  }, [personImageFile]);

  React.useEffect(() => {
    if (initialData?.personImageUrl) {
      setPersonImagePreview(initialData.personImageUrl);
    }
    if (initialData?.itemImageUrl) {
      setItemImagePreview(initialData.itemImageUrl);
    }
  }, [initialData]);

  React.useEffect(() => {
    let itemUrl: string | undefined;
    if (itemImageFile) {
      itemUrl = URL.createObjectURL(itemImageFile);
      setItemImagePreview(itemUrl);
    }
    return () => {
      if (itemUrl) URL.revokeObjectURL(itemUrl);
    };
  }, [itemImageFile]);
  const router = useRouter();

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

  const onSubmit = async (data: RecordFormData) => {
    setIsSubmitting(true);
    try {
      const personImageUrl = personImageFile
        ? await uploadToS3(personImageFile, 'person')
        : undefined;
      const itemImageUrl = itemImageFile
        ? await uploadToS3(itemImageFile, 'item')
        : undefined;

      const recordData = {
        ...data,
        personImageUrl,
        itemImageUrl,
      };

      const url = isEdit ? `/api/records/${recordId}` : '/api/records';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await api.request(url, {
        method,
        body: recordData,
      });
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
                <div>
                  <Label htmlFor="personImage">Person Image</Label>
                  <Input
                    id="personImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setPersonImageFile(e.target.files?.[0] || null)
                    }
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isEdit
                      ? 'Leave empty to keep current image'
                      : 'Upload person image'}
                  </p>
                  {personImagePreview && (
                    <img
                      src={personImagePreview}
                      alt="Person preview"
                      className="mt-2 max-h-32 object-contain"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="itemImage">Item Image</Label>
                  <Input
                    id="itemImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setItemImageFile(e.target.files?.[0] || null)
                    }
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isEdit
                      ? 'Leave empty to keep current image'
                      : 'Upload item image'}
                  </p>
                  {itemImagePreview && (
                    <img
                      src={itemImagePreview}
                      alt="Item preview"
                      className="mt-2 max-h-32 object-contain"
                    />
                  )}
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
    </div>
  );
}
