import Image from 'next/image';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function WelcomePage() {
  const cookieStore = await cookies();
  const sessionData = cookieStore.get('hemat_session')?.value;
  let name = '';
  
  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      name = parsed.name ? `${parsed.name}` : '';
    } catch(e) {}
  }

  return (
    <div className="h-full bg-soft-gray p-4 md:p-8 flex flex-col items-center justify-center overflow-y-auto w-full">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden mt-4 mb-4 animate-fade-in-up">
        <div className="bg-[#00875A] p-12 text-white text-center relative">
          <div className="flex justify-center mb-8">
            <Image src="/icon-192x192.png" alt="HEMAT Logo" width={120} height={120} className="bg-white p-3 rounded-3xl shadow-2xl" unoptimized />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">
            Selamat Datang di Aplikasi HEMAT
          </h1>
          {name && (
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#E6F4EA]">
              Halo, {name}!
            </h2>
          )}
          <p className="text-xl text-green-100 font-medium tracking-wide mt-2">
            Help Manage Anything The Café
          </p>
        </div>
      </div>
    </div>
  );
}
