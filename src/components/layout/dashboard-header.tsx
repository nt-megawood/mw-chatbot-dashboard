import { Moon, RefreshCw, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DashboardPage = 'analytics' | 'conversations';

type DashboardHeaderProps = {
  loading: boolean;
  isDark: boolean;
  currentPage: DashboardPage;
  onToggleTheme: () => void;
  onRefresh: () => void;
  onNavigate: (page: DashboardPage) => void;
};

export function DashboardHeader({ loading, isDark, currentPage, onToggleTheme, onRefresh, onNavigate }: DashboardHeaderProps) {
  return (
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 shadow-soft md:px-5">
      <div className="flex items-center gap-3">
        <img
          className="h-auto w-20 md:w-24"
          src="https://assets.planungswelten.de/wp-content/uploads/2022/03/08172642/megawood_logo.png"
          alt="megawood logo"
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">megawood Chatbot Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={currentPage === 'analytics' ? 'default' : 'outline'} onClick={() => onNavigate('analytics')}>
              Statistiken
            </Button>
            <Button size="sm" variant={currentPage === 'conversations' ? 'default' : 'outline'} onClick={() => onNavigate('conversations')}>
              Konversationen
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onToggleTheme} aria-label="Farbschema wechseln">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="ml-2">{isDark ? 'Lightmode' : 'Darkmode'}</span>
        </Button>
        <Button onClick={onRefresh} disabled={loading}>
          <RefreshCw className={loading ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          Aktualisieren
        </Button>
      </div>
    </header>
  );
}
