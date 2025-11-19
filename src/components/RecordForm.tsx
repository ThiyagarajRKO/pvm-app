'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
}

export default function RecordForm({
  initialData,
  isEdit = false,
  recordId,
}: RecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personImageFile, setPersonImageFile] = useState<File | null>(null);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
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

      router.push('/records');
    } catch (error) {
      console.error('Error saving record:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Record' : 'Create New Record'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      <Input placeholder="Enter city/place" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : isEdit
                    ? 'Update Record'
                    : 'Save Record'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
