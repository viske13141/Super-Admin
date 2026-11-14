import React from 'react';
import { Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-[#E8EBF4] p-12 text-center max-w-lg mx-auto mt-10">
      <div className="w-12 h-12 rounded-2xl bg-[#EFEAFF] text-[#7050F5] flex items-center justify-center mx-auto mb-4">
        <Compass className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-[#0F172A]">Page Not Found</h1>
      <p className="text-sm text-[#64748B] mt-2">
        The requested Super Admin console route does not exist or has moved.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-5 px-5 py-2.5 bg-[#7050F5] hover:bg-[#5E3DE6] text-white text-sm font-medium rounded-xl transition-colors"
      >
        Return to Dashboard
      </button>
    </div>
  );
};
