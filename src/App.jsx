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
import AgencyCreate from "./pages/AgencyCreate.jsx";
import RequireAuth from "./routes/RequireAuth.jsx";
import ListingDetailPage from "./pages/ListingDetailPage.jsx";
import MyPurchases from "./pages/MyPurchases.jsx";
import MyFavorites from "./pages/MyFavorites.jsx";
import MyReviews from "./pages/MyReviews.jsx";
import EditListingAgency from "./pages/EditListingAgency.jsx";
import ListingDetailAgency from "./pages/ListingDetailAgency.jsx";
import AgencySales from "./pages/AgencySales.jsx";
import AgencyCustomers from "./pages/AgencyCustomers.jsx";
import CreateListingAgency from "./pages/CreateListingAgency.jsx";

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
                <Route
                  path='/agencies/listings/:id'
                  element={
                    <RequireAuth roles={["agency"]}>
                      <ListingDetailAgency />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/agencies/listings/new'
                  element={
                    <RequireAuth roles={["agency"]}>
                      <CreateListingAgency />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/agencies/listings/:id/edit'
                  element={
                    <RequireAuth roles={["agency"]}>
                      <EditListingAgency />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/listings/:id'
                  element={
                    <RequireAuth roles={["buyer"]}>
                      <ListingDetailPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/my-purchases'
                  element={
                    <RequireAuth roles={["buyer"]}>
                      <MyPurchases />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/admin/agencies/new'
                  element={
                    <RequireAuth roles={["admin"]}>
                      <AgencyCreate />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/my-favorites'
                  element={
                    <RequireAuth roles={["buyer"]}>
                      <MyFavorites />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/my-reviews'
                  element={
                    <RequireAuth roles={["buyer"]}>
                      <MyReviews />
                    </RequireAuth>
                  }
                />
                <Route
                  path='/agencies/sales'
                  element={
                    <RequireAuth roles={["agency"]}>
                      <AgencySales />
                    </RequireAuth>
                  }
                />

                <Route
                  path='/agencies/customers'
                  element={
                    <RequireAuth roles={["agency"]}>
                      <AgencyCustomers />
                    </RequireAuth>
                  }
                />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </>
      )}
    </ThemeController>
  );
}

export default App;
