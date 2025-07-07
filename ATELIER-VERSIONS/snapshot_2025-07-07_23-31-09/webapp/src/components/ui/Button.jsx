import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  onClick,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-apple-gray-900 text-white hover:bg-apple-gray-800 focus:ring-apple-gray-500',
    secondary: 'bg-apple-gray-100 text-apple-gray-900 hover:bg-apple-gray-200 focus:ring-apple-gray-500',
    ghost: 'text-apple-gray-600 hover:text-apple-gray-900 hover:bg-apple-gray-50 focus:ring-apple-gray-500'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;