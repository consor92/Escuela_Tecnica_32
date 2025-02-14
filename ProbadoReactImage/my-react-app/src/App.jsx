import React, { useState } from "react";
import Resizer from "react-image-file-resizer";
import imageCompression from "browser-image-compression";

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para cambiar tamaño, comprimir y subir la imagen
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (file) {
      setLoading(true);
      setError(null);

      try {
        // Comprimir la imagen usando browser-image-compression
        const compressionOptions = {
          maxWidthOrHeight: 800,  // Cambiar a un tamaño máximo
          useWebWorker: true,
        };
        const compressedImage = await imageCompression(file, compressionOptions);

        // Redimensionar la imagen con react-image-file-resizer
        Resizer.imageFileResizer(
          compressedImage,  // Utilizamos la imagen comprimida
          800,  // Ancho máximo
          800,  // Alto máximo
          "JPEG",  // Formato de la imagen
          60,  // Calidad de la imagen (de 0 a 100)
          0,  // Rotación de la imagen
          (uri) => {
            // Convertir el URI en un archivo para enviar al servidor
            fetch(uri)
              .then((res) => res.blob())  // Convertir base64 a blob
              .then((blob) => {
                const resizedFile = new File([compressedImage], "resized-image.jpg", {
                  type: "image/jpeg",
                });
                setImage(URL.createObjectURL(resizedFile));  // Establecer la imagen procesada
                uploadImageToServer(resizedFile);  // Subir la imagen al servidor
              })
              .catch((err) => {
                setError("Error al procesar la imagen.");
                console.error(err);
              });
          },
          "blob"  // Usar 'blob' para manejar la imagen como archivo
        );
      } catch (err) {
        setError("Error al procesar la imagen");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para subir la imagen procesada al servidor
  const uploadImageToServer = async (imageData) => {
    try {
      const formData = new FormData();
      formData.append("file", imageData);  // Agregar el archivo procesado

      // Realizar la subida de la imagen al servidor
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir la imagen al servidor");
      }

      const data = await response.json();
      console.log("Imagen subida con éxito:", data);
    } catch (err) {
      console.error("Error al subir la imagen:", err);
      setError("No se pudo subir la imagen al servidor");
    }
  };

  return (
    <div>
      <input type="file" name="file" onChange={handleImageUpload} />
      {loading && <p>Procesando imagen...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {image && <img src={image} alt="Imagen procesada" />}
    </div>
  );
};

export default ImageUpload;
