import React, { useState } from 'react';
import Home from './components/Home';
import Dashboard from './components/Dashboard';

function App() {
  const [data, setData] = useState(null);

  const handleUpload = (uploadedData) => {
    setData(uploadedData);
  };

  const handleReset = () => {
    setData(null);
  };

  return (
    <div>
      {!data ? (
        <Home onUploadSuccess={handleUpload} />
      ) : (
        <Dashboard data={data} onReset={handleReset} />
      )}
    </div>
  );
}

export default App;
