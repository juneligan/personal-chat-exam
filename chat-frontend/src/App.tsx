import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import {AuthProvider} from './context/AuthContext';
import Chat from "./pages/Chat.tsx";
import {ThemeProvider} from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle'; // 🔥 Add this

const App: React.FC = () => (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <ThemeToggle /> {/* 🔥 Add toggle here so it's visible on all pages */}
          <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/chat" element={<Chat/>}/>
            <Route path="*" element={<Navigate to="/login"/>}/>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
);

export default App;
