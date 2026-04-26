import React, { useState } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AssetDragDropZone({ onFileSelect, acceptedFormats = '.pdf' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileInputChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }
    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    onFileSelect(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
        isDragging
          ? 'border-primary bg-primary/5 scale-105'
          : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50'
      }`}
    >
      <input
        type="file"
        accept={acceptedFormats}
        onChange={handleFileInputChange}
        className="hidden"
        id="asset-file-input"
      />
      
      {!file ? (
        <label htmlFor="asset-file-input" className="block cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground/60" />
          <p className="text-base font-semibold mb-1">Drag and drop your PDF here</p>
          <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
          <p className="text-xs text-muted-foreground">PDF files only • Max 50MB</p>
        </label>
      ) : (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
            <File className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="text-sm text-primary hover:underline"
          >
            Choose a different file
          </button>
        </div>
      )}
    </div>
  );
}