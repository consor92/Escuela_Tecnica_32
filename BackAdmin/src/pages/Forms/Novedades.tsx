import { useState } from "react";
import axios from "axios";

import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import FileInputExample from "../../components/form/form-elements/FileInputExample";
import DropzoneComponent from "../../components/form/form-elements/DropZone";
import ToggleSwitch from "../../components/form/form-elements/ToggleSwitch";
import TagInput from "../../components/form/form-elements/TagInput";
import SelectInputs from "../../components/form/form-elements/SelectInputs";
import SubmitButton from "../../components/form/form-elements/SubmitButton";


export default function NuevaNovedad() {
    const [titulo, setTitulo] = useState("");
    const [copete, setCopete] = useState("");
    const [cuerpo, setCuerpo] = useState("");
    const [url, setUrl] = useState("");
    const [area, setArea] = useState<string[]>([]);
    const [esEvento, setEsEvento] = useState(false);
    const [fechaEvento, setFechaEvento] = useState("");
    const [direccion, setDireccion] = useState("");
    const [hora, setHora] = useState("");
    const [fecha, setFecha] = useState("");
    const [requisitos, setRequisitos] = useState("");
    const [alertaPagina, setAlertaPagina] = useState(false);
    const [notificarUsuarios, setNotificarUsuarios] = useState(false);
    const [tieneDireccion, setTieneDireccion] = useState(false);
    const [tieneRequisitos, setTieneRequisitos] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagenPortada, setImagenPortada] = useState<File | null>(null);
    const [imagenesAdicionales, setImagenesAdicionales] = useState<File[]>([]);



    // Simulación de datos del usuario logueado y fecha actual
    const usuario = "Juan Pérez";
    const fechaActual = new Date().toISOString().split("T")[0];








const handleSubmit = async () => {
  const errores: string[] = [];

  // Validaciones generales
  if (!titulo.trim()) errores.push("El título es obligatorio.");
  if (!copete.trim()) errores.push("El copete es obligatorio.");
  if (!cuerpo.trim()) errores.push("El cuerpo es obligatorio.");
  if (area.length === 0) errores.push("Debe seleccionar al menos un área.");
  if (!imagenPortada) errores.push("La imagen de portada es obligatoria.");
  if (url && !/^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/.test(url)) {
    errores.push("La URL ingresada no es válida.");
  }
  if (esEvento) {
    if (!fechaEvento) errores.push("Debe seleccionar la fecha del evento.");
    if (tieneDireccion) {
      if (!direccion.trim()) errores.push("La dirección es obligatoria.");
      if (!fecha) errores.push("La fecha de la dirección es obligatoria.");
      if (!hora) errores.push("La hora es obligatoria.");
    }
  }

  if (errores.length > 0) {
    alert("Revisá los siguientes campos:\n\n" + errores.join("\n"));
    return;
  }

  setIsSubmitting(true);

  try {
    const formData = new FormData();

    formData.append("usuario", usuario);
    formData.append("fechaCreacion", fechaActual);
    formData.append("titulo", titulo);
    formData.append("copete", copete);
    formData.append("cuerpo", cuerpo);
    formData.append("url", url || "");
    formData.append("esEvento", esEvento ? "true" : "false");
    formData.append("fechaEvento", esEvento && fechaEvento ? fechaEvento : "");
    formData.append("alertaPagina", alertaPagina ? "true" : "false");
    formData.append("notificarUsuarios", notificarUsuarios ? "true" : "false");
    formData.append("direccion", tieneDireccion ? direccion : "");
    formData.append("fechaDireccion", tieneDireccion && fecha ? fecha : "");
    formData.append("hora", tieneDireccion ? hora : "");
    formData.append("requisitos", tieneRequisitos ? requisitos : "");

    formData.append("area", JSON.stringify(area));
    formData.append("tags", JSON.stringify(tags));

    if (imagenPortada) {
      formData.append("imagenPortada", imagenPortada);
    }

    if (imagenesAdicionales && imagenesAdicionales.length > 0) {
      imagenesAdicionales.forEach((file, idx) => {
        formData.append(`imagenesAdicionales[${idx}]`, file);
      });
    }

    // Token JWT guardado (ejemplo: en localStorage)

    const token = localStorage.getItem("jwt-token") || "";

    const response = await axios.post(
      "http://localhost/et32/novedades/new",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200) {
      alert("Novedad publicada correctamente!");
      
      // Limpiar formulario
      setTitulo("");
      setCopete("");
      setCuerpo("");
      setUrl("");
      setArea([]);
      setTags([]);
      setImagenPortada(null);
      setImagenesAdicionales([]);
      setEsEvento(false);
      setFechaEvento("");
      setAlertaPagina(false);
      setNotificarUsuarios(false);
      setTieneDireccion(false);
      setDireccion("");
      setFecha("");
      setHora("");
      setTieneRequisitos(false);
      setRequisitos("");
    } else {
      alert("Error al publicar la novedad. Intenta nuevamente.");
    }
  } catch (error) {
    console.error(error);
    alert("Error en la conexión o el servidor.");
  } finally {
    setIsSubmitting(false);
  }


};











    return (
        <>
            <PageMeta title="Nueva Novedad" description="" />
            <PageBreadcrumb pageTitle="Crear Novedad" />

            <div className="grid grid-cols-12 gap-6">
                {/* Información del usuario y fecha */}
                <div className="col-span-6">
                    <ComponentCard title="Usuario">
                        <input
                            type="text"
                            value={usuario}
                            disabled
                            className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"

                        />
                    </ComponentCard>
                </div>
                <div className="col-span-6">
                    <ComponentCard title="Fecha de Creacion">
                        <input
                            type="date"
                            value={fechaActual}
                            disabled
                            className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"

                        />
                    </ComponentCard>
                </div>

                {/* Título */}
                <div className="col-span-12">
                    <ComponentCard title="Título">
                        <input
                            type="text"
                            placeholder="Título de la novedad"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"

                        />
                    </ComponentCard>
                </div>

                {/* Copete */}
                <div className="col-span-12">
                    <ComponentCard title="Copete">
                        <textarea
                            placeholder="Resumen breve"
                            value={copete}
                            onChange={(e) => setCopete(e.target.value)}
                            className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"

                            rows={2}
                        />
                    </ComponentCard>
                </div>

                {/* Cuerpo */}
                <div className="col-span-12">
                    <ComponentCard title="Cuerpo">
                        <textarea
                            placeholder="Contenido principal"
                            value={cuerpo}
                            onChange={(e) => setCuerpo(e.target.value)}
                            className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"

                            rows={6}
                        />
                    </ComponentCard>
                </div>

                {/* URL y Área */}
                <div className="col-span-6">
                    <ComponentCard title="URL">
                        <input
                            type="url"
                            placeholder="https://ejemplo.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"

                        />
                    </ComponentCard>
                </div>
                <div className="col-span-6">

                    <ComponentCard title="Área de Publicación">
                        <SelectInputs selectedValues={area} onChange={setArea} />

                    </ComponentCard>
                </div>

                {/* Imagen de Portada y Etiquetas */}
                <div className="col-span-6">
                    <ComponentCard title="Imagen de Portada">
                        <FileInputExample onFileSelect={setImagenPortada} />
                        <TagInput tags={tags} setTags={setTags} />
                    </ComponentCard>
                </div>

                {/* Imágenes Adicionales */}
                <div className="col-span-6">
                    <ComponentCard title="Imágenes Adicionales">
                        <DropzoneComponent onFilesChange={setImagenesAdicionales} />

                    </ComponentCard>
                </div>



                {/* Evento */}
                <div className="col-span-12">
                    <ComponentCard title="¿Es un Evento Calendario?">
                        <ToggleSwitch enabled={esEvento} setEnabled={setEsEvento} />
                        {esEvento && (
                            <div className="mt-4 space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block mb-1">Fecha del Evento</label>
                                        <input
                                            type="date"
                                            value={fechaEvento}
                                            onChange={(e) => setFechaEvento(e.target.value)}
                                            className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"

                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1">¿Mostrar Alerta en Página?</label>
                                        <ToggleSwitch enabled={alertaPagina} setEnabled={setAlertaPagina} />
                                    </div>
                                    <div>
                                        <label className="block mb-1">¿Notificar a Usuarios?</label>
                                        <ToggleSwitch enabled={notificarUsuarios} setEnabled={setNotificarUsuarios} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-1">¿Tiene Dirección Física?</label>
                                    <ToggleSwitch enabled={tieneDireccion} setEnabled={setTieneDireccion} />
                                    {tieneDireccion && (
                                        <div className="mt-2 grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block mb-1">Dirección</label>
                                                <input
                                                    type="text"
                                                    value={direccion}
                                                    onChange={(e) => setDireccion(e.target.value)}
                                                    className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"

                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1">Fecha</label>
                                                <input
                                                    type="date"
                                                    value={fecha}
                                                    onChange={(e) => setFecha(e.target.value)}
                                                    className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"

                                                />
                                            </div>
                                            <div>
                                                <label className="block mb-1">Hora</label>
                                                <input
                                                    type="time"
                                                    value={hora}
                                                    onChange={(e) => setHora(e.target.value)}
                                                    className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"

                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1">¿Tiene Requisitos?</label>
                                    <ToggleSwitch enabled={tieneRequisitos} setEnabled={setTieneRequisitos} />
                                    {tieneRequisitos && (
                                        <div className="mt-2">
                                            <label className="block mb-1">Requisitos</label>
                                            <textarea
                                                value={requisitos}
                                                onChange={(e) => setRequisitos(e.target.value)}
                                                className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </ComponentCard>
                </div>
            </div>

            <div className="col-span-12 flex justify-end mt-6">
                <SubmitButton isLoading={isSubmitting} onClick={handleSubmit}>
                    Publicar Novedad
                </SubmitButton>
            </div>
        </>
    );
}
