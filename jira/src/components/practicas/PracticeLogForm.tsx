'use client';

import React, { useState } from 'react';
// @ts-expect-error
import IconClock from '@tabler/icons-react/dist/esm/icons/IconClock';
// @ts-expect-error
import IconBook from '@tabler/icons-react/dist/esm/icons/IconBook';
// @ts-expect-error
import IconBuilding from '@tabler/icons-react/dist/esm/icons/IconBuilding';
// @ts-expect-error
import IconSend from '@tabler/icons-react/dist/esm/icons/IconSend';

interface Company {
  id: number;
  name: string;
}

interface PracticeLogFormProps {
  companies: Company[];
  onSave: (data: any) => void;
}

const PracticeLogForm: React.FC<PracticeLogFormProps> = ({ companies, onSave }) => {
  const [companyId, setCompanyId] = useState(companies[0]?.id || 0);
  const [hours, setHours] = useState('');
  const [log, setLog] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      companyId,
      hours: parseFloat(hours),
      log,
      date: new Date()
    });
  };

  return (
    <form onSubmit={handleSave} className="p-4 bg-white rounded-xl shadow-lg border border-slate-200 max-w-md mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
          <IconBook size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Bitácora de Práctica</h2>
          <p className="text-xs text-slate-500">Carga diaria de actividades</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <IconBuilding size={18} className="text-slate-400" /> Empresa / Institución
          </label>
          <select 
            value={companyId} 
            onChange={(e) => setCompanyId(parseInt(e.target.value))}
            className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 text-slate-800 appearance-none"
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <IconClock size={18} className="text-slate-400" /> Horas Efectivas
          </label>
          <input 
            type="number" 
            step="0.5"
            min="0"
            max="12"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej: 4.5"
            required
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            Bitácora del Día
          </label>
          <textarea 
            className="w-full p-3 border rounded-xl bg-slate-50 h-40 focus:ring-2 focus:ring-indigo-500"
            placeholder="Describa las tareas realizadas hoy..."
            value={log}
            onChange={(e) => setLog(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <IconSend size={20} /> Enviar Bitácora
        </button>
      </div>
    </form>
  );
};

export default PracticeLogForm;
