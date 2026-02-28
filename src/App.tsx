import { useState, useEffect } from "react";
import { isLoggedIn, logout, getMe } from "./api/auth";
import { WhatsAppPanel } from "./components/WhatsAppPanel";
import { Login } from "./components/Login";

type Tab = "whatsapp";

function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [user, setUser] = useState<{ email: string; orgId: string } | null>(
    null
  );
  const [activeTab] = useState<Tab>("whatsapp");

  useEffect(() => {
    if (loggedIn) {
      getMe().then((me) => {
        if (me) setUser(me);
        else {
          logout();
          setLoggedIn(false);
        }
      });
    }
  }, [loggedIn]);

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen bg-bg text-text font-sans text-sm">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-surface border-r border-border flex flex-col">
        <div className="px-4 py-4 border-b border-border">
          <h1 className="font-mono text-[10.5px] tracking-widest text-text-muted uppercase select-none">
            Agent Dashboard
          </h1>
        </div>

        <nav className="flex-1 py-2">
          <button
            className={`w-full text-left px-4 py-2 text-xs transition-colors ${
              activeTab === "whatsapp"
                ? "bg-surface-hi text-text"
                : "text-text-muted hover:bg-surface-hi hover:text-text"
            }`}
          >
            WhatsApp
          </button>
        </nav>

        <div className="border-t border-border px-4 py-3 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-surface-hi border border-border-hi flex items-center justify-center text-[10px] font-mono text-text-muted select-none">
            {user?.email?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-dim font-mono truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              setLoggedIn(false);
            }}
            className="text-text-dim text-xs hover:text-text-muted transition-colors"
            title="Logout"
          >
            x
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {activeTab === "whatsapp" && <WhatsAppPanel />}
      </main>
    </div>
  );
}

export default App;
