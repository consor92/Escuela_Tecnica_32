import React, { useEffect, useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface DropzoneComponentProps {
  onFilesChange: (files: File[]) => void;
}

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({ onFilesChange }) => {
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    if (previewFiles.length >= 4) {
      toast.error("Solo se pueden subir hasta 4 imágenes.");
      return;
    }

    const remainingSlots = 4 - previewFiles.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);

    const totalFiles = [...previewFiles, ...filesToAdd];
    setPreviewFiles(totalFiles);
    onFilesChange(totalFiles);
  };

  const removeImage = (indexToRemove: number) => {
    const removedPreview = previews[indexToRemove];
    if (removedPreview) URL.revokeObjectURL(removedPreview);

    const updatedFiles = previewFiles.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);

    setPreviewFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onFilesChange(updatedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
    multiple: true,
  });

  useEffect(() => {
    const objectUrls = previewFiles.map(file => URL.createObjectURL(file));
    setPreviews(objectUrls);

    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewFiles]);

  return (
    <ComponentCard title="Imágenes Adicionales (hasta 4)">
      <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
        <form
          {...getRootProps()}
          className={`dropzone rounded-xl border-dashed border-gray-300 p-6 lg:p-8
        ${
          isDragActive
            ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
            : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
        }
      `}
        >
          <input {...getInputProps()} disabled={previewFiles.length >= 4} />
          <div className="dz-message flex flex-col items-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                📁
              </div>
            </div>
            <h4 className="mb-2 font-semibold text-gray-800 text-theme-base dark:text-white/90">
              {isDragActive ? "Soltá los archivos aquí" : "Arrastrá & Soltá imágenes"}
            </h4>
            <span className="text-center mb-2 block w-full max-w-[250px] text-xs text-gray-700 dark:text-gray-400">
              PNG, JPG, WebP o SVG. Máximo 4 imágenes.
            </span>
            <span className="font-medium underline text-xs text-brand-500">
              Buscar archivo
            </span>
          </div>
        </form>

        {previews.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mt-4">
            {previews.map((url, index) => (
              <div key={index} className="relative rounded overflow-hidden shadow-sm border dark:border-gray-700">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full p-1 hover:bg-red-100 dark:hover:bg-red-600 hover:text-red-600 text-xs"
                  aria-label="Eliminar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ComponentCard>
  );
};

export default DropzoneComponent;
