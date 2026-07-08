'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { importUsersCSV, exportEvaluationsCSV } from './data-mgmt-actions';
import { notifications } from '@mantine/notifications';
// @ts-expect-error
import IconUpload from '@tabler/icons-react/dist/esm/icons/IconUpload';
// @ts-expect-error
import IconDownload from '@tabler/icons-react/dist/esm/icons/IconDownload';
// @ts-expect-error
import IconCircleCheck from '@tabler/icons-react/dist/esm/icons/IconCircleCheck';
// @ts-expect-error
import IconAlertCircle from '@tabler/icons-react/dist/esm/icons/IconAlertCircle';
// @ts-expect-error
import IconRefresh from '@tabler/icons-react/dist/esm/icons/IconRefresh';
// @ts-expect-error
import IconLoader2 from '@tabler/icons-react/dist/esm/icons/IconLoader2';

export default function DataPanel() {
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setResults(null); // Limpiar resultados previos

        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: async (csv) => {
                try {
                    let data = csv.data;
                    if (!data || data.length === 0) {
                        notifications.show({ title: 'Archivo vacío', message: 'El archivo CSV no contiene datos.', color: 'yellow' });
                        setImporting(false);
                        return;
                    }

                    // Detección de cabeceras
                    const firstRowStr = JSON.stringify(data[0]).toLowerCase();
                    if (firstRowStr.includes('email') || firstRowStr.includes('nombre') || firstRowStr.includes('usuario')) {
                        data = data.slice(1);
                    }

                    const res = await importUsersCSV(data);
                    setResults(res);
                } catch (error: any) {
                    notifications.show({ title: 'Error de importación', message: error.message, color: 'red' });
                } finally {
                    setImporting(false);
                    // Resetear el input para permitir subir el mismo archivo otra vez
                    e.target.value = '';
                }
            },
            error: (err) => {
                notifications.show({ title: 'Error de lectura', message: 'No se pudo leer el archivo CSV.', color: 'red' });
                setImporting(false);
                e.target.value = '';
            }
        });
    };

    const handleExport = async () => {
        const data = await exportEvaluationsCSV();
        const csv = Papa.unparse(data, { delimiter: ';' });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `calificaciones_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card" style={{ padding: '1rem', border: '2px dashed var(--primary-color)', background: 'rgba(74, 144, 226, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>Centro de Datos</h4>
                    <span style={{ fontSize: '0.7rem', background: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>CSV IMPORT/EXPORT</span>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="btn" style={{ background: '#38a169', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        {importing ? <IconLoader2 size={18} className="animate-spin" /> : <IconUpload size={18} />}
                        <span>{importing ? 'Importando...' : 'Importar Alumnos'}</span>
                        <input 
                            type="file" 
                            accept=".csv" 
                            onChange={handleImport} 
                            style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                    </div>
                    <button className="btn" style={{ background: '#4a5568', color: 'white' }} onClick={handleExport}>
                        <IconDownload size={18} /> Exportar Notas
                    </button>
                </div>
            </div>

            {results && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h5 style={{ margin: 0 }}>Resultado de la última importación:</h5>
                        <button className="btn-icon" onClick={() => setResults(null)} title="Cerrar reporte"><IconRefresh size={14} /></button>
                    </div>
                    <div className="table-container" style={{ maxHeight: '250px' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Alumno / Email</th>
                                    <th>Estado</th>
                                    <th>Mensaje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <tr key={i} style={{ 
                                        background: r.status === 'success' ? 'rgba(56, 161, 105, 0.1)' : 
                                                    r.status === 'skip' ? 'rgba(236, 201, 75, 0.1)' : 'rgba(229, 62, 62, 0.1)' 
                                    }}>
                                        <td><strong>{r.nombre || '-'}</strong> <br/><small>{r.email}</small></td>
                                        <td>
                                            {r.status === 'success' && <span style={{ color: '#2f855a' }}><IconCircleCheck size={14} /> Agregado</span>}
                                            {r.status === 'skip' && <span style={{ color: '#b7791f' }}><IconAlertCircle size={14} /> Omitido</span>}
                                            {r.status === 'error' && <span style={{ color: '#c53030' }}><IconAlertCircle size={14} /> Error</span>}
                                        </td>
                                        <td><small>{r.message}</small></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
