import { useMemo } from "react";
import useAuth from "../infra/useAuth.js";
import AdminReportsDashboard from "../components/AdminReportsDashboard";
import BuyerHomeListings from "../components/BuyerHomeListings";
import AgencyHomeListings from "../components/AgencyHomeListings.jsx";
import GuestHomeIntro from "../components/GuestHomeIntro";

const getPrimaryRole = (roles = []) => {
  const L = roles.map((r) => String(r).toLowerCase());
  if (L.includes("admin")) return "admin";
  if (L.includes("buyer")) return "buyer";
  if (L.includes("agency")) return "agency";
  return "guest";
};

const ROLE_UI = {
  admin: {
    label: "Administrador",
    color: "secondary",
    message: "Tenés acceso completo al panel.",
  },
  buyer: {
    label: "Compras",
    color: "success",
    message: "Gestioná órdenes y compras.",
  },
  agency: {
    label: "Agencia",
    color: "warning",
    message: "Accedé a las funciones de agencia.",
  },
  guest: {
    label: "Invitado",
    color: "default",
    message: "Estás en modo charlie. Iniciá sesión para más funciones.",
  },
};

export default function Home() {
  const { isAuthenticated, roles = [] } = useAuth();
  const role = useMemo(() => getPrimaryRole(roles), [roles]);
  const ui = ROLE_UI[role];
  const isAgency = role === "agency";
  const isAdmin = role === "admin";

  return (
    <>
      {!isAuthenticated ? (
        <GuestHomeIntro ui={ui} />
      ) : isAgency ? (
        <AgencyHomeListings />
      ) : isAdmin ? (
        <AdminReportsDashboard />
      ) : (
        <BuyerHomeListings />
      )}
    </>
  );
}
