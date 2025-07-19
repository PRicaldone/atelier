const Input = ({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  error,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-apple-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2 
          bg-apple-gray-50 
          border border-apple-gray-200 
          rounded-lg 
          text-apple-gray-900 
          placeholder-apple-gray-400
          focus:outline-none focus:ring-2 focus:ring-apple-gray-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;