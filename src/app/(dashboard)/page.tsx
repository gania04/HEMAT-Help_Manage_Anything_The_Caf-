import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function WelcomePage() {
  return (
    <main className="h-full w-full flex flex-col items-center justify-center p-4 relative bg-[#F8FAFC]">
      <div className="text-center animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-black text-[#00875A] mb-4 tracking-tight drop-shadow-sm">
          Selamat Datang di Aplikasi HEMAT
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 font-medium tracking-wide">
          Help Manage Anything The Café
        </p>
      </div>
      
      <div className="absolute inset-0 pointer-events-none bg-[url('/pattern.svg')] opacity-5 bg-repeat"></div>
    </main>
  );
}
