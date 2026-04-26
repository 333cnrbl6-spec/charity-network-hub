import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PhotoCapture({ onPhotosChange, photos = [] }) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    await uploadPhotos(files);
  };

  const uploadPhotos = async (files) => {
    setUploading(true);
    try {
      const uploadedPhotos = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedPhotos.push({
          file_url,
          uploaded_at: new Date().toISOString(),
          caption: '',
        });
      }
      onPhotosChange([...photos, ...uploadedPhotos]);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-1 gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          Upload Photo
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative bg-muted rounded overflow-hidden group">
              <img
                src={photo.file_url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-24 object-cover"
              />
              <button
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center py-2">
          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}