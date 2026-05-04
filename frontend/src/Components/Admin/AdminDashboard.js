import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [files, setFiles] = useState(['news.json', 'cooperadora.json', 'disciplines.json', 'infraestructura.json']);
  const [selectedFile, setSelectedFile] = useState('news.json');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(selectedFile);
  }, [selectedFile]);

  const fetchData = async (fileName) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/getData?fileName=${fileName}`);
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/saveData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: selectedFile, data }),
      });
      if (response.ok) alert('Datos guardados correctamente');
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const updateField = (index, field, value) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard Administrativo</h1>
      <select onChange={(e) => setSelectedFile(e.target.value)} value={selectedFile}>
        {files.map(f => <option key={f} value={f}>{f}</option>)}
      </select>

      {loading ? <p>Cargando...</p> : data && (
        <div>
          {data.map((item, index) => (
            <div key={item.id || index} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              {Object.keys(item).map(key => (
                <div key={key}>
                  <label>{key}:</label>
                  <input 
                    value={item[key] || ''} 
                    onChange={(e) => updateField(index, key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ))}
          <button onClick={handleSave}>Guardar Cambios</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
