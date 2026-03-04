import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Condominos } from "./pages/Condominos";
import { Financeiro } from "./pages/Financeiro";
import { Obras } from "./pages/Obras";
import { Reservas } from "./pages/Reservas";
import { GestaoUtilizadores } from "./pages/GestaoUtilizadores";
import { Seguranca } from "./pages/Seguranca";
import { Visao3D } from "./pages/Visao3D";
import { UserHome } from "./pages/UserHome";
import { UserPagamentos } from "./pages/UserPagamentos";
import { UserReservar } from "./pages/UserReservar";
import { UserObras } from "./pages/UserObras";
import { UserPerfil } from "./pages/UserPerfil";
import { MainLayout } from "./components/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <MainLayout userType="admin" />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "condominos", element: <Condominos /> },
      { path: "financeiro", element: <Financeiro /> },
      { path: "obras", element: <Obras /> },
      { path: "reservas", element: <Reservas /> },
      { path: "utilizadores", element: <GestaoUtilizadores /> },
      { path: "seguranca", element: <Seguranca /> },
      { path: "visao3d", element: <Visao3D /> },
    ],
  },
  {
    path: "/user",
    element: <MainLayout userType="user" />,
    children: [
      { index: true, element: <UserHome /> },
      { path: "pagamentos", element: <UserPagamentos /> },
      { path: "reservar", element: <UserReservar /> },
      { path: "obras", element: <UserObras /> },
      { path: "perfil", element: <UserPerfil /> },
      { path: "seguranca", element: <Seguranca /> },
      { path: "visao3d", element: <Visao3D /> },
    ],
  },
]);