import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { AppProvider, useApp } from "./context/AppContext";
import { LoginPage } from "./components/pages/LoginPage";
import { Layout } from "./components/Layout";
import { OverviewPage } from "./components/pages/OverviewPage";
import { WhatsAppPage } from "./components/pages/WhatsAppPage";
import { KnowledgeUploadPage } from "./components/pages/KnowledgeUploadPage";
import { KnowledgeListPage } from "./components/pages/KnowledgeListPage";
import { UsersPage } from "./components/pages/UsersPage";
import { OrganizationsPage } from "./components/pages/OrganizationsPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { CatalogPage } from "./components/pages/CatalogPage";
import { Skeleton } from "./components/ui/Skeleton";

function AppContent() {
  const auth = useAuth();
  const { authState, setAuthState, activeView } = useApp();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      setAuthState({ status: "unauthenticated" });
      return;
    }
    auth.getMe().then((me) => {
      if (me) {
        setAuthState({ status: "authenticated", user: me });
      } else {
        auth.logout();
        setAuthState({ status: "unauthenticated" });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = () => {
    auth.getMe().then((me) => {
      if (me) {
        setAuthState({ status: "authenticated", user: me });
      }
    });
  };

  const handleLogout = () => {
    auth.logout();
    setAuthState({ status: "unauthenticated" });
  };

  if (authState.status === "loading") {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="space-y-4 w-80">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (authState.status === "unauthenticated") {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout onLogout={handleLogout}>
      <div className="animate-fade-in-up" key={activeView}>
        {activeView === "overview" && <OverviewPage />}
        {activeView === "whatsapp" && <WhatsAppPage />}
        {activeView === "knowledge-upload" && <KnowledgeUploadPage />}
        {activeView === "knowledge-list" && <KnowledgeListPage />}
        {activeView === "users" && <UsersPage />}
        {activeView === "organizations" && <OrganizationsPage />}
        {activeView === "catalogs" && <CatalogPage />}
        {activeView === "settings" && <SettingsPage />}
      </div>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
