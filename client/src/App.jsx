import React, { useState } from 'react';
import Header from './Header.jsx';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  return (
    <div className="app-container" style={{ direction: 'rtl' }}>
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-color)', marginTop: '40px' }}>שורת הניווט של Wolt מוכנה! 🚀</h2>
        <p style={{ color: 'var(--text-color)', opacity: 0.7 }}>
          הלוגו נטען מה-Assets, החיפוש במרכז, והכתובת מופיעה בצורה מותנית משמאל.
        </p>
      </main>
    </div>
  );
}

export default App;