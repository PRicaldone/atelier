import { useMemo } from 'react';
import { useStore } from '../../store';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const isSidebarCollapsed = useStore((state) => state.isSidebarCollapsed);
  
  const sidebarWidth = useMemo(() => {
    return isSidebarCollapsed ? 64 : 240;
  }, [isSidebarCollapsed]);
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Sidebar />
      <main 
        className="pt-16 transition-all duration-300 relative"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="relative" style={{ height: 'calc(100vh - 64px)' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;