import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '../../store.js';
import { Image, Upload, Link, RotateCw, Trash2 } from 'lucide-react';

export const ImageCard = ({ element }) => {
  const { updateElement } = useCanvasStore();
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  const { data } = element;

  const handleFileUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      updateElement(element.id, {
        data: {
          ...data,
          src: e.target.result,
          alt: file.name,
          name: file.name
        }
      });
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleUrlInput = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      updateElement(element.id, {
        data: {
          ...data,
          src: url,
          alt: 'Image from URL'
        }
      });
    }
  };

  const removeImage = () => {
    updateElement(element.id, {
      data: {
        ...data,
        src: null,
        alt: '',
        name: ''
      }
    });
  };

  const rotateImage = () => {
    updateElement(element.id, {
      rotation: (element.rotation + 90) % 360
    });
  };

  return (
    <motion.div
      className="w-full h-full rounded-lg border-2 border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-200 relative overflow-hidden group"
      whileHover={{ y: -2 }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {data.src ? (
        // Image display
        <>
          <img
            src={data.src}
            alt={data.alt || 'Canvas image'}
            className="w-full h-full object-cover"
            style={{
              objectFit: data.objectFit || 'cover',
              borderRadius: `${data.borderRadius || 8}px`,
              opacity: data.opacity || 1,
              filter: data.filter || 'none'
            }}
          />
          
          {/* Image controls overlay */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <div className="flex space-x-2">
              <button
                onClick={rotateImage}
                className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                title="Rotate"
              >
                <RotateCw size={16} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                title="Replace image"
              >
                <Upload size={16} />
              </button>
              <button
                onClick={handleUrlInput}
                className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                title="Load from URL"
              >
                <Link size={16} />
              </button>
              <button
                onClick={removeImage}
                className="p-2 bg-red-500 bg-opacity-80 text-white rounded-full hover:bg-opacity-100 transition-all"
                title="Remove image"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>

          {/* Image info */}
          {data.name && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 truncate">
              {data.name}
            </div>
          )}
        </>
      ) : (
        // Empty state
        <div
          className={`w-full h-full flex flex-col items-center justify-center p-4 border-2 border-dashed transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Upload size={24} className="text-gray-400" />
            </motion.div>
          ) : (
            <>
              <Image size={32} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 text-center mb-3">
                Drop an image here or click to upload
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Upload
                </button>
                <button
                  onClick={handleUrlInput}
                  className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                >
                  From URL
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Upload size={24} className="text-blue-500" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};