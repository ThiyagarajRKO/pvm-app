'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api-client';

interface ImageFile {
  file: File;
  preview: string;
  url?: string;
  uploading: boolean;
  error?: string;
  id: string;
}

interface ImageFile {
  file: File;
  preview: string;
  url?: string;
  uploading: boolean;
  error?: string;
  id: string;
}

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
}) => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Supported types: ${acceptedTypes.join(', ')}`;
    }
    if (file.size > maxFileSize) {
      return `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }
    return null;
  };

  const uploadFile = async (fileData: ImageFile): Promise<void> => {
    try {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id ? { ...f, uploading: true, error: undefined } : f
        )
      );

      // Get presigned URL
      const presignResponse = await api.post('/s3/presign', {
        fileName: fileData.file.name,
        contentType: fileData.file.type,
        folder: 'pawn-records',
      });
      if (presignResponse.error) throw new Error(presignResponse.error);
      const { uploadUrl, publicUrl } = presignResponse.data;

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: fileData.file,
        headers: {
          'Content-Type': fileData.file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Update file with success
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id ? { ...f, uploading: false, url: publicUrl } : f
        )
      );

      // Add to images array
      onImagesChange([...images, publicUrl]);

      // Remove from files state since it's now in images
      setFiles((prev) => prev.filter((f) => f.id !== fileData.id));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? { ...f, uploading: false, error: errorMessage }
            : f
        )
      );
    }
  };

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;

      const newFiles: ImageFile[] = [];
      const currentTotal = images.length + files.length;

      for (
        let i = 0;
        i < fileList.length && currentTotal + newFiles.length < maxImages;
        i++
      ) {
        const file = fileList[i];
        const validationError = validateFile(file);

        const fileData: ImageFile = {
          file,
          preview: URL.createObjectURL(file),
          uploading: false,
          id: `${Date.now()}-${Math.random()}`,
          error: validationError || undefined,
        };

        newFiles.push(fileData);
      }

      setFiles((prev) => [...prev, ...newFiles]);

      // Start uploading valid files
      newFiles.forEach((fileData) => {
        if (!fileData.error) {
          uploadFile(fileData);
        }
      });
    },
    [images.length, files.length, maxImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFiles]
  );

  const extractS3Key = (imageUrl: string): string => {
    // Assuming imageUrl is like: https://bucket.s3.amazonaws.com/pawn-records/filename.jpg
    // We need to extract: pawn-records/filename.jpg
    const url = new URL(imageUrl);
    return url.pathname.substring(1); // Remove leading slash
  };

  const removeFile = async (fileId: string, imageUrl?: string) => {
    // Remove from files state
    const fileToRemove = files.find((f) => f.id === fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));

    // Clean up preview URL
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    // Remove from images array if uploaded
    if (imageUrl) {
      onImagesChange(images.filter((img) => img !== imageUrl));

      // Delete from server if it was uploaded
      try {
        const key = extractS3Key(imageUrl);
        await api.post('/s3/delete', { key });
      } catch (error) {
        console.error('Failed to delete image:', error);
      }
    }
  };

  const removeExistingImage = async (imageUrl: string) => {
    onImagesChange(images.filter((img) => img !== imageUrl));

    // Delete from server
    try {
      const key = extractS3Key(imageUrl);
      await api.post('/s3/delete', { key });
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };
  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
    setLightboxOpen(true);
  };

  const totalImages = images.length + files.filter((f) => f.url).length;
  const canAddMore = totalImages < maxImages;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`cursor-pointer rounded-lg border-2 border-dashed p-3 text-center transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <div className="space-y-1">
            <p className="text-xs text-gray-600">
              Click to browse or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {acceptedTypes.join(', ')} • Max{' '}
              {Math.round(maxFileSize / 1024 / 1024)}MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* Image Grid */}
      {(images.length > 0 || files.length > 0) && (
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Existing Images */}
          {images.map((imageUrl, index) => (
            <div key={`existing-${index}`} className="group relative">
              <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={imageUrl}
                  alt={`Uploaded ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-0 opacity-0 transition-all duration-200 group-hover:bg-opacity-50 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(imageUrl);
                    }}
                    className="rounded-full bg-white bg-opacity-80 p-2 transition-colors hover:bg-opacity-100"
                  >
                    <Eye className="h-4 w-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExistingImage(imageUrl);
                    }}
                    className="rounded-full bg-white bg-opacity-80 p-2 transition-colors hover:bg-opacity-100"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Uploading Files */}
          {files.map((fileData) => (
            <div key={fileData.id} className="relative">
              <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={fileData.preview}
                  alt={fileData.file.name}
                  className="h-full w-full object-cover"
                />
                {fileData.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
                {fileData.error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-90">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                )}
                {fileData.url && (
                  <div className="absolute right-2 top-2 rounded-full bg-green-500 p-1">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(fileData.id, fileData.url)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
              {fileData.error && (
                <p
                  className="mt-1 truncate text-xs text-red-600"
                  title={fileData.error}
                >
                  {fileData.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Simple Image Preview Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={lightboxImage}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 rounded-full bg-white p-2 text-black hover:bg-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
