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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  onCancel?: () => void;
}

export default function RecordForm({
  initialData,
  isEdit = false,
  recordId,
  compact = false,
  onCancel,
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
      name: initialData?.name || '',
      fatherName: initialData?.fatherName || '',
      street: initialData?.street || '',
      place: initialData?.place || '',
      weightGrams: initialData?.weightGrams || 0,
      itemType: initialData?.itemType || 'Gold',
      amount: initialData?.amount || 0,
      mobile: initialData?.mobile || '',
      personImageUrl: initialData?.personImageUrl || '',
      itemImageUrl: initialData?.itemImageUrl || '',
    },
  });

  const onSubmit = async (data: RecordFormData) => {
    setIsSubmitting(true);
    try {
      let personImageUrl = data.personImageUrl;
      let itemImageUrl = data.itemImageUrl;

      // Upload images if files are selected
      if (personImageFile) {
        personImageUrl = await uploadToS3(personImageFile, 'person');
      }
      if (itemImageFile) {
        itemImageUrl = await uploadToS3(itemImageFile, 'item');
      }

      const recordData = {
        ...data,
        personImageUrl,
        itemImageUrl,
      };

      const url = isEdit ? `/api/records/${recordId}` : '/api/records';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        throw new Error('Failed to save record');
      }
      // close sheet if onCancel is provided (mobile) or navigate back on desktop
      if (onCancel) onCancel();
      else router.push('/records/active');

      toast.success(isEdit ? 'Record updated' : 'Record created');
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter father's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 10-digit mobile number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="place"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place</FormLabel>
                      <FormControl>
                        <PlaceSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          contentClassName="max-h-[300px]"
                        />
                      </FormControl>
                      <FormMessage />
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (grams)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="itemType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select item type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Gold">Gold</SelectItem>
                          <SelectItem value="Silver">Silver</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
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
