import React, { useState } from 'react';

const Home = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Upload failed');
      }

      const data = await response.json();
      onUploadSuccess(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Cost<span className="text-gradient">Advisor</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '2.5rem' }}>
           « Explique-moi les chiffres comme si j’étais manager »
        </p>

        <div 
          className="upload-area"
          style={{ 
            border: '2px dashed rgba(255,255,255,0.2)', 
            borderRadius: '12px', 
            padding: '2rem',
            background: 'rgba(255,255,255,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative'
          }}
        >
            <input 
                type="file" 
                onChange={handleFileChange} 
                accept=".csv, .xlsx, .xls"
                disabled={loading}
                style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, width: '100%', height: '100%', 
                    opacity: 0, cursor: 'pointer' 
                }}
            />
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                    <div className="spinner" style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }}></div>
                    <p>Analyse des données...</p>
                </div>
            ) : (
                <>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📂</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Déposez votre fichier ici</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>ou cliquez pour sélectionner (CSV, Excel)</p>
                </>
            )}
        </div>

        {error && (
            <div className="glass-panel" style={{ marginTop: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#fca5a5', padding: '1rem', fontSize: '0.9rem' }}>
                ⚠️ {error}
            </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Home;
