import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children, title, subtitle }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-canvas)]">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64 min-w-0 overflow-hidden">
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
