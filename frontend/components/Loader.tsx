import React from 'react';

interface LoaderProps {
  message?: string;
  subMessage?: string;
}

const Loader: React.FC<LoaderProps> = ({
  message = "Analyzing Case Documents...",
  subMessage = "This may take a moment."
}) => {
  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex flex-col justify-center items-center z-50">
      <div className="w-16 h-16 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-brand-light font-semibold">{message}</p>
      <p className="mt-2 text-sm text-gray-400">{subMessage}</p>
    </div>
  );
};

export default Loader;
