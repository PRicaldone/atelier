import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Grid3x3, 
  Rocket, 
  FolderOpen, 
  Zap,
  Calendar,
  Menu
} from 'lucide-react';
import { useStore } from '../../store';

const menuItems = [
  { id: 'canvas', label: 'Visual Canvas', icon: Grid3x3, path: '/canvas' },
  { id: 'start', label: 'Project Start', icon: Rocket, path: '/start' },
  { id: 'tracker', label: 'Project Tracker', icon: FolderOpen, path: '/tracker' },
  { id: 'content', label: 'Content Studio', icon: Calendar, path: '/content' },
  { id: 'business', label: 'Business Mode', icon: Zap, path: '/business' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSidebarCollapsed = useStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useStore((state) => state.toggleSidebar);

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ 
        x: 0,
        width: isSidebarCollapsed ? 64 : 240 
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-16 bottom-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden z-10"
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-between text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            {!isSidebarCollapsed && (
              <span className="text-sm font-medium">
                Modules
              </span>
            )}
            <motion.div
              animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </motion.div>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-lg
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-gray-900 dark:bg-gray-700 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;