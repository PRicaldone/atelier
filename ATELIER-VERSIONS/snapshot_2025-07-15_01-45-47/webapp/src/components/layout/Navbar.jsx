import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { APP_NAME } from '../../config/constants';
import { useTheme } from '../../hooks/useTheme';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700"
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{APP_NAME}</h1>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Projects
            </a>
            <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Canvas
            </a>
            <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Resources
            </a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            Settings
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;