import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../infra/useAuth.js";

export default function RequireAuth({ children, roles = [] }) {
  const { isAuthenticated, roles: userRoles = [] } = useAuth();
  const location = useLocation();

  // Si no está autenticado → a /login y recordamos de dónde venía
  if (!isAuthenticated) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  // Si la ruta exige roles y el usuario no cumple → a /403
  if (
    roles.length > 0 &&
    !roles.some((r) =>
      userRoles
        .map((x) => String(x).toLowerCase())
        .includes(String(r).toLowerCase())
    )
  ) {
    return <Navigate to='/403' replace />;
  }

  return children;
}
