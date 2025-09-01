import "./App.css";
import Home from "./pages/Home";
import About from "./pages/About";
import MainLayout from "./layouts/MainLayout";
import ThemeController from "./theme/ThemeController";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./infra/AuthContext.jsx";
import useAuth from "./infra/useAuth.js";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function App() {
  // Ejemplo: el rol viene de tu auth
  //const [userRole] = useState("admin"); // 'admin' | 'editor' | 'viewer' ...
  const { isAuthenticated, roles = [] } = useAuth() ?? {};
  const lower = roles.map((r) => String(r).toLowerCase());

  const roleForTheme = !isAuthenticated
    ? "guest"
    : lower.includes("admin")
    ? "admin"
    : lower.includes("buyer")
    ? "buyer"
    : lower.includes("agency")
    ? "agency"
    : "guest"; // fallback seguro

  return (
    <ThemeController role={roleForTheme} initialMode='light'>
      {({ mode, toggleMode }) => (
        <>
          <BrowserRouter>
            <MainLayout mode={mode} toggleMode={toggleMode} title='CTA'>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/about' element={<About />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </>
      )}
    </ThemeController>
  );
}

export default App;
