export default function FechaEventoInput() {
  return (
    <div>
      <label className="mb-2 block text-black dark:text-white">Fecha del evento</label>
      <input
        type="date"
        className="w-full rounded border border-stroke bg-transparent py-2 px-4 text-black dark:text-white dark:border-form-strokedark dark:bg-form-input"
      />
    </div>
  );
}
