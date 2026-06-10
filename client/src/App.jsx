import React, { useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Orders from './pages/Orders.jsx';

// const Home = () => <h2 style={{ color: 'var(--text-color)' }}>עמוד הבית - רשימת מסעדות 🍔</h2>;
//const Orders = () => <h2 style={{ color: 'var(--text-color)' }}>ההזמנות שלי 📦</h2>;
// const Login = () => <h2 style={{ color: 'var(--text-color)' }}>דף התחברות למערכת 🔑</h2>;
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RestaurantDetails from './pages/RestaurantDetails';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  // State for logged-in user details
  const [currentUser, setCurrentUser] = useState(null);

  // // Fetch user details if token and userId exist in localStorage
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   const userId = localStorage.getItem('userId');

  //   // if we have a token and userId but no currentUser data, fetch the profile from the server
  //   if (token && userId && !currentUser) {
  //     fetch(`http://localhost:3000/api/users/${userId}`, {
  //       method: 'GET',
  //       headers: {
  //          // Send JWT token for security
  //         'Authorization': `Bearer ${token}`
  //       }
  //     })
  //     .then(res => res.json())
  //     .then(userData => {
  //       if (!userData.error) {
  //         // Save profile data
  //         setCurrentUser(userData);
  //       }
  //     })
  //     .catch(err => console.error("Error fetching profile:", err));
  //   }
  // }, [currentUser]);


  // Fetch user details if token and userId exist in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    console.log("=== בדיקת סנכרון בתוך App.jsx ===");
    console.log("1. האם קיים טוקן בדפדפן?", token ? "כן" : "לא");
    console.log("2. האם קיים userId בדפדפן?", userId ? userId : "לא");

    if (token && userId && !currentUser) {
      fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(userData => {
        console.log("3. מה השרת ענה כשביקשנו את הפרופיל?", userData);
        
        if (!userData.error) {
          setCurrentUser(userData);
          console.log("4. המשתמש עודכן בהצלחה בסטייט!");
        } else {
          console.log(" שגיאה מהשרת:", userData.error);
        }
      })
      .catch(err => console.error(" שגיאה קריטית בחיבור לשרת:", err));
    }
  }, [currentUser]);



  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  return (
    <Router>
      <div className="app-container" style={{ direction: 'rtl' }}>
        {/* שינוי 1: מעבירים ל-Header את המשתמש הנוכחי ואת פונקציית העדכון שלו */}
        <Header darkMode={darkMode} toggleTheme={toggleTheme} currentUser={currentUser} setCurrentUser={setCurrentUser} />

        <main> 
          <Routes>
            {/* שינוי 2: מעבירים ל-Login את האפשרות לעדכן את המשתמש הגלובלי מיד בהתחברות */}
            <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
            <Route path="/register" element={<Register />} />
            
            {/* שינוי 3: מעבירים ל-Home את המשתמש כדי שההרשאות וכפתורי האדמין יתעדכנו */}
            <Route path="/" element={<Home currentUser={currentUser} />} />
            
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders currentUser={currentUser} />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;