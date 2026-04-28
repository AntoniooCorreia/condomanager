import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";

import Login from "./pages/Auth/Login";
import { MainLayout } from "./components/layout/MainLayout";
import NotFound from "./pages/not-found";

// Admin pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { Condominos } from "./pages/admin/Condominos";
import { Financeiro } from "./pages/admin/Financeiro";
import { Obras } from "./pages/shared/Obras";
import { Reservas } from "./pages/shared/Reservas";
import { Seguranca } from "./pages/shared/Seguranca";

// User pages
import { UserHome } from "./pages/user/UserHome";
import { UserPagamentos } from "./pages/user/UserPagamentos";
import { UserPerfil } from "./pages/user/UserPerfil";
import { UserCameras } from "./pages/user/UserCameras";
import { Avisos } from "./pages/shared/Avisos";
import { UserCobrancas } from "./pages/user/UserCobrancas";

const AdminRoute = ({ component: Component }: { component: React.ComponentType }) => (
  <MainLayout requireAdmin={true}>
    <Component />
  </MainLayout>
);

const UserRoute = ({ component: Component }: { component: React.ComponentType }) => (
  <MainLayout requireAdmin={false}>
    <Component />
  </MainLayout>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />

      <Route path="/admin"><AdminRoute component={AdminDashboard} /></Route>
      <Route path="/admin/condominos"><AdminRoute component={Condominos} /></Route>
      <Route path="/admin/financeiro"><AdminRoute component={Financeiro} /></Route>
      <Route path="/admin/obras"><AdminRoute component={Obras} /></Route>
      <Route path="/admin/reservas"><AdminRoute component={Reservas} /></Route>
      <Route path="/admin/utilizadores"><AdminRoute component={Condominos} /></Route>
      <Route path="/admin/seguranca"><AdminRoute component={Seguranca} /></Route>
      <Route path="/admin/camaras"><AdminRoute component={UserCameras} /></Route>

      <Route path="/user"><UserRoute component={UserHome} /></Route>
      <Route path="/user/pagamentos"><UserRoute component={UserPagamentos} /></Route>
      <Route path="/user/reservar"><UserRoute component={Reservas} /></Route>
      <Route path="/user/obras"><UserRoute component={Obras} /></Route>
      <Route path="/user/seguranca"><UserRoute component={Seguranca} /></Route>
      <Route path="/user/perfil"><UserRoute component={UserPerfil} /></Route>
      <Route path="/user/camaras"><UserRoute component={UserCameras} /></Route>
      <Route path="/user/cobrancas"><UserRoute component={UserCobrancas} /></Route>
      <Route path="/user/avisos"><UserRoute component={Avisos} /></Route>
      <Route path="/user/chat"><UserRoute component={Chat} /></Route>
      <Route path="/admin/avisos"><AdminRoute component={Avisos} /></Route>
      <Route path="/admin/chat"><AdminRoute component={Chat} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;