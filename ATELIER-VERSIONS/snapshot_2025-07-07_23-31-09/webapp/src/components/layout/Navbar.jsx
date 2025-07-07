import { motion } from 'framer-motion';
import { APP_NAME } from '../../config/constants';

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200"
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-semibold text-gray-900">{APP_NAME}</h1>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Projects
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Canvas
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Resources
            </a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Settings
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;