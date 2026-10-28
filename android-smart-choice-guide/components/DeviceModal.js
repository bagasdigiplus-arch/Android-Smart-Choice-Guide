import { 
  X, Cpu, HardDrive, Smartphone, Camera, Battery, Zap, 
  Shield, Box, RefreshCw, Star, ThumbsUp, Wifi, CheckCircle 
} from 'lucide-react';

export default function DeviceModal({ isOpen, device, onClose }) {
  if (!isOpen || !device) return null;

  // Komponen Helper untuk merender spesifikasi
  const SpecItem = ({ icon: Icon, label, value }) => {
    if (!value) return null;

    // Logika untuk mengubah teks strip (-) menjadi bullet points rapi
    const renderValue = (text) => {
      // Memisahkan teks berdasarkan baris baru (Enter di dalam sel Google Sheets)
      const lines = text.toString().split('\n').filter(line => line.trim() !== '');
      
      // Mengecek apakah ada baris yang diawali dengan tanda strip (-) atau bullet (•)
      const isList = lines.some(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
      
      if (isList) {
        return (
          <ul className="list-disc pl-4 space-y-1.5 mt-1 marker:text-blue-500">
            {lines.map((line, idx) => {
              // Menghapus tanda strip/bullet bawaan agar diganti dengan titik rapi dari Tailwind
              const cleanLine = line.trim().replace(/^[-•]\s*/, '');
              if (!cleanLine) return null;
              return (
                <li key={idx} className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-snug text-justify">
                  {cleanLine}
                </li>
              );
            })}
          </ul>
        );
      }

      // Jika bukan list (teks biasa)
      return <p className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-snug whitespace-pre-line mt-1">{text}</p>;
    };

    return (
      <div className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-all hover:border-blue-200 dark:hover:border-blue-900/50">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 mt-0.5">
          <Icon size={18} />
        </div>
        <div className="flex-1 w-full">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
          {renderValue(value)}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300">
        
        {/* Tombol Tutup */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-600 dark:text-gray-300" />
        </button>

        {/* Bagian Gambar Kiri */}
        <div className="w-full md:w-2/5 bg-gray-50 dark:bg-gray-800/50 p-8 flex items-center justify-center border-r border-gray-200 dark:border-gray-800">
          {device.image_url ? (
            <img src={device.image_url} alt={device.model} className="w-full h-auto object-contain max-h-80 drop-shadow-xl" />
          ) : (
            <div className="w-48 h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center shadow-inner">
              <Smartphone size={48} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Bagian Spesifikasi Kanan (Bisa di-scroll) */}
        <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider rounded-full">
              {device.brand}
            </span>
            <h2 className="text-3xl font-extrabold mt-3 text-gray-900 dark:text-white">{device.model}</h2>
            {device.price > 0 && (
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                Rp {Number(device.price).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <SpecItem icon={Cpu} label="Chipset" value={device.chipset} />
            <SpecItem icon={HardDrive} label="RAM / ROM" value={device.ram_rom} />
            <SpecItem icon={Smartphone} label="Layar" value={device.screen_size} />
            <SpecItem icon={Battery} label="Baterai" value={device.battery} />
            <SpecItem icon={Zap} label="Pengecasan" value={device.charging} />
            <SpecItem icon={CheckCircle} label="OS" value={device.os} />
            <SpecItem icon={Camera} label="Kamera Utama" value={device.camera} />
            <SpecItem icon={Camera} label="Kamera Depan" value={device.front_camera} />
            <SpecItem icon={Wifi} label="Jaringan" value={device.network} />
            <SpecItem icon={HardDrive} label="SIM" value={device.sim} />
            <SpecItem icon={Box} label="Material" value={device.material} />
            <SpecItem icon={RefreshCw} label="Dukungan Update" value={device.update_support} />
          </div>

          {/* Bagian Fitur Unggulan (Full Width) */}
          <div className="space-y-3">
            <SpecItem icon={Shield} label="Ketahanan (Durability)" value={device.durability} />
            <SpecItem icon={Star} label="Keunggulan" value={device.features} />
            <SpecItem icon={ThumbsUp} label="Cocok Untuk" value={device.best_for} />
          </div>
        </div>

      </div>
    </div>
  );
}
