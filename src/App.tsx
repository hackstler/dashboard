import { useState, useEffect } from "react";
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

function AppContent() {
  const auth = useAuth();
  const [loggedIn, setLoggedIn] = useState(auth.isLoggedIn());
  const { setUser, activeView } = useApp();

  useEffect(() => {
    if (loggedIn) {
      auth.getMe().then((me) => {
        if (me) {
          setUser(me);
        } else {
          auth.logout();
          setLoggedIn(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
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
