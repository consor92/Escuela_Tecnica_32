'use client';

import React, { useState } from 'react';
// @ts-expect-error
import IconUsers from '@tabler/icons-react/dist/esm/icons/IconUsers';
// @ts-expect-error
import IconAlertCircle from '@tabler/icons-react/dist/esm/icons/IconAlertCircle';
// @ts-expect-error
import IconDeviceFloppy from '@tabler/icons-react/dist/esm/icons/IconDeviceFloppy';

interface Member {
  id: number;
  name: string;
}

interface CeremonyLoggerProps {
  cellId: number;
  members: Member[];
  onSave: (data: any) => void;
}

const CeremonyLogger: React.FC<CeremonyLoggerProps> = ({ cellId, members, onSave }) => {
  const [type, setType] = useState('Daily');
  const [attendance, setAttendance] = useState<number[]>(members.map(m => m.id));
  const [blocks, setBlocks] = useState('');
  const [agreements, setAgreements] = useState('');

  const toggleAttendance = (id: number) => {
    setAttendance(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave({
      cellId,
      type,
      attendance,
      blocks,
      agreements,
      timestamp: new Date()
    });
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg border border-slate-200 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <IconUsers className="text-blue-600" /> Registro de Ceremonia
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Ceremonia</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500"
          >
            <option>Planning</option>
            <option>Daily</option>
            <option>Review</option>
            <option>Retrospective</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Asistencia</label>
          <div className="grid grid-cols-1 gap-2">
            {members.map(member => (
              <label key={member.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={attendance.includes(member.id)}
                  onChange={() => toggleAttendance(member.id)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm text-slate-700">{member.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <span className="flex items-center gap-1"><IconAlertCircle size={16} className="text-amber-500" /> Bloqueos detectados</span>
          </label>
          <textarea 
            className="w-full p-2 border rounded-lg bg-slate-50 h-24"
            placeholder="Describa impedimentos..."
            value={blocks}
            onChange={(e) => setBlocks(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Acuerdos / Minuta</label>
          <textarea 
            className="w-full p-2 border rounded-lg bg-slate-50 h-24"
            placeholder="Acuerdos tomados..."
            value={agreements}
            onChange={(e) => setAgreements(e.target.value)}
          />
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <IconDeviceFloppy size={20} /> Guardar Registro
        </button>
      </div>
    </div>
  );
};

export default CeremonyLogger;
