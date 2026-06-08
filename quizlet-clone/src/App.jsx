import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Header from "./components/Header";
import Folders from "./components/Folders";
import FolderDetail from "./components/FolderDetail"; // Đảm bảo đã import cái này
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import Module from "./components/Module";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/folders" element={<Folders />} />
          <Route path="/folders/:id" element={<FolderDetail />} />
          <Route path="/modules/:id" element={<Module />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
