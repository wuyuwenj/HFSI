import React, { useState } from 'react';

interface DocumentInputProps {
  onAnalyze: (documents: string) => void;
}

const DocumentInput: React.FC<DocumentInputProps> = ({ onAnalyze }) => {
  const [documents, setDocuments] = useState('');

  const handleAnalyzeClick = () => {
    if (documents.trim()) {
      onAnalyze(documents);
    }
  };

  const loadSampleData = () => {
    setDocuments(`
      --- Witness Statement: John Doe (Jan 15, 2023) ---
      I saw a red car speeding away from the bank around 10:05 PM. The driver was wearing a black hoodie. It was definitely a sports car, maybe a Ferrari.

      --- Police Report #123 (Jan 15, 2023) ---
      Officer Smith responded to a silent alarm at First National Bank at 22:10. Security footage shows a blue sedan leaving the parking lot at 22:07. The license plate was partially obscured.

      --- Security Guard Log: Mike Ross (Jan 15, 2023) ---
      Everything was quiet until the alarm went off. I did see a blue Toyota Camry in the lot around 10 PM. Didn't think anything of it.

      --- Alibi Statement: Susan Roe (Jan 16, 2023) ---
      John Doe was with me at my apartment from 9 PM to 11 PM on the night of the 15th. We were watching a movie. We didn't leave.

      --- Forensic Report #F456 (Jan 18, 2023) ---
      Tire tracks found at the scene match a standard-issue sedan tire, not a high-performance sports car. A fiber sample matching a generic blue cotton-poly blend was found near the vault door.
    `);
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-slate-800 rounded-lg shadow-2xl p-6 md:p-10 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">VeriJudex</h1>
          <p className="text-lg text-blue-300 mt-2">AI-Powered Judicial Decision Support</p>
        </div>
        <p className="text-gray-300 text-center">
          Paste all relevant case documents below. VeriJudex will analyze the unstructured text to highlight inconsistencies, build timelines, and provide a comprehensive decision-making dashboard.
        </p>
        <textarea
          className="w-full h-80 p-4 bg-slate-900 border border-slate-700 rounded-md text-gray-200 focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition duration-200 resize-none"
          placeholder="Paste witness statements, police reports, forensic analyses, etc. here..."
          value={documents}
          onChange={(e) => setDocuments(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleAnalyzeClick}
            disabled={!documents.trim()}
            className="flex-1 py-3 px-6 bg-brand-secondary text-white font-bold rounded-md hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 2a1 1 0 011-1h6a1 1 0 110 2H8a1 1 0 01-1-1zm-1 5a1 1 0 000 2h10a1 1 0 100-2H6zm0 4a1 1 0 100 2h10a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Analyze Documents
          </button>
          <button
            onClick={loadSampleData}
            className="flex-1 py-3 px-6 bg-slate-600 text-white font-bold rounded-md hover:bg-slate-500 transition duration-200"
          >
            Load Sample Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentInput;
