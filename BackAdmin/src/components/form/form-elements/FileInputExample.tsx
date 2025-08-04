import React, { useState, useEffect } from "react";
import Label from "../Label";
import FileInput from "../input/FileInput";

interface FileInputExampleProps {
  onFileSelect: (file: File | null) => void;
}

export default function FileInputExample({ onFileSelect = () => {} }: FileInputExampleProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    onFileSelect(file); // enviamos el archivo al componente padre
  };

  // Liberar el object URL cuando cambie o se desmonte el componente
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onFileSelect(null);
  };

  return (
    <div>
      <Label>Imagen de portada</Label>
      <FileInput onChange={handleFileChange} className="custom-class" />
      
      {previewUrl && (
        <div className="relative inline-block mt-3">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-24 w-24 object-cover rounded-md border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
            aria-label="Quitar imagen"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
