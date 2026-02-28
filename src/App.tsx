import { useState, useEffect } from "react";
import { isLoggedIn, logout, getMe } from "./api/auth";
import { AppProvider, useApp } from "./context/AppContext";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { Overview } from "./components/Overview";
import { WhatsAppPanel } from "./components/WhatsAppPanel";
import { KnowledgeUpload } from "./components/KnowledgeUpload";
import { KnowledgeList } from "./components/KnowledgeList";
import { UserList } from "./components/UserList";
import { OrganizationList } from "./components/OrganizationList";

function AppContent() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const { setUser, activeView } = useApp();

  useEffect(() => {
    if (loggedIn) {
      getMe().then((me) => {
        if (me) {
          setUser(me);
        } else {
          logout();
          setLoggedIn(false);
        }
      });
    }
  }, [loggedIn, setUser]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <Layout onLogout={handleLogout}>
      <div className="animate-fade-in-up" key={activeView}>
        {activeView === "overview" && <Overview />}
        {activeView === "whatsapp" && <WhatsAppPanel />}
        {activeView === "knowledge-upload" && <KnowledgeUpload />}
        {activeView === "knowledge-list" && <KnowledgeList />}
        {activeView === "users" && <UserList />}
        {activeView === "organizations" && <OrganizationList />}
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
