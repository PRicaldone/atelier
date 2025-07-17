import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '',
  hover = true,
  padding = true,
  ...props 
}) => {
  const baseStyles = 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700';
  const paddingStyles = padding ? 'p-6' : '';
  
  if (hover) {
    return (
      <motion.div
        whileHover={{ 
          y: -4,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
        transition={{ duration: 0.2 }}
        className={`${baseStyles} ${paddingStyles} ${className} cursor-pointer`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div 
      className={`${baseStyles} ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;