import { useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import About from "./pages/About";
import MainLayout from "./layouts/MainLayout";
import ThemeController from "./theme/ThemeController";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  // Ejemplo: el rol viene de tu auth
  const [userRole] = useState("admin"); // 'admin' | 'editor' | 'viewer' ...
  return (
    <ThemeController role={userRole} initialMode='light'>
      {({ mode, toggleMode }) => (
        <>
          <BrowserRouter>
            <MainLayout mode={mode} toggleMode={toggleMode} title='Panel'>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/about' element={<About />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </>
      )}
    </ThemeController>
  );
}

export default App;
