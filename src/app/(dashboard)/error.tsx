'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-xl shadow-sm border border-red-100">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan pada Dasbor</h2>
      <p className="text-sm text-red-600 mb-6 bg-red-50 p-3 rounded-lg border border-red-100 max-w-lg overflow-auto text-left">
        {error.message || "Unknown error occurred"}
        <br/><br/>
        <span className="text-xs text-gray-500">{error.stack}</span>
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-[#00875A] text-white font-bold rounded-lg hover:bg-green-700 transition"
      >
        Coba Muat Ulang
      </button>
    </div>
  );
}
