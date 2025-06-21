import React, { useState } from 'react';
import './App.css';
import processPDF from './processPDF';

function App() {
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const headers = [
    "Nome", "Data", "Cirurgia", "Porte Cirúrgico", "Grupo", "Subespecialidade",
    "Idade", "Sexo", "Prontuário", "PREC-CP", "Posto", "Estado de Origem",
    "1º Cirurgião", "2º Cirurgião", "1º Auxiliar", "2º Auxiliar",
    "Complicação", "ATB Profilaxia", "Internação", "Alta"
  ];

  const fieldMapping = {
    "Nome": "nome",
    "Data": "data",
    "Cirurgia": "cirurgia",
    "Porte Cirúrgico": "porte_cirurgico",
    "Grupo": "grupo",
    "Subespecialidade": "subespecialidade",
    "Idade": "idade",
    "Sexo": "sexo",
    "Prontuário": "prontuario",
    "PREC-CP": "prec_cp",
    "Posto": "posto",
    "Estado de Origem": "estado_origem",
    "1º Cirurgião": "primeiro_cirurgiao",
    "2º Cirurgião": "segundo_cirurgiao",
    "1º Auxiliar": "primeiro_aux",
    "2º Auxiliar": "segundo_aux",
    "Complicação": "complicacao",
    "ATB Profilaxia": "atbprofilaxia",
    "Internação": "internacao",
    "Alta": "alta"
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const result = await processPDF(file);
      if (result.success) {
        const rowData = headers.map(header => {
          const fieldName = fieldMapping[header];
          return result.data[fieldName] || '';
        });
        setTableData([rowData]);
      } else {
        setError(result.error || 'Erro ao processar PDF');
      }
    } catch (err) {
      setError('Erro inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };

  const downloadCSV = () => {
    if (tableData.length === 0) return;

    let csvContent = headers.join(',') + '\n';
    
    tableData.forEach(row => {
      csvContent += row.map(field => 
        `"${field ? field.toString().replace(/"/g, '""') : ''}"`
      ).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'dados_cirurgia.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container dark-mode">
      <div className="upload-section">
        <h1>Processador de PDF Cirúrgico</h1>
        <form onSubmit={handleSubmit}>
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
            disabled={loading}
            className="file-input"
          />
          <button type="submit" disabled={loading || !file} className="submit-btn">
            {loading ? 'Processando...' : 'Extrair Dados'}
          </button>
        </form>
        
        {error && <div className="error-message">{error}</div>}
      </div>

      {tableData.length > 0 && (
        <div className="data-section">
          <div className="table-header">
            <h2>Dados Extraídos</h2>
            <button onClick={downloadCSV} className="download-button">
              Exportar como CSV
            </button>
          </div>
          
          <div className="table-wrapper">
            <table className="responsive-table">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          value={cell || ''}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          className="cell-input"
                        />
                      </td>
                    ))}
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

export default App;
