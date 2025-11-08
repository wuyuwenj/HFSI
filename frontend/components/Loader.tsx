import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-brand-dark bg-opacity-80 flex flex-col justify-center items-center z-50">
      <div className="w-16 h-16 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-brand-light font-semibold">Analyzing Case Documents...</p>
      <p className="mt-2 text-sm text-gray-400">This may take a moment.</p>
    </div>
  );
};

export default Loader;
