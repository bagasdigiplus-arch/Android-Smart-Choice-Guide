import { 
  X, Cpu, HardDrive, Smartphone, Camera, Battery, Zap, 
  Shield, Box, RefreshCw, Star, ThumbsUp, Wifi, CheckCircle 
} from 'lucide-react';

export default function DeviceModal({ isOpen, device, onClose }) {
  if (!isOpen || !device) return null;

  const SpecItem = ({ icon: Icon, label, value }) => {
    if (!value) return null;

    const renderValue = (text) => {
      const lines = text.toString().split('\n').filter(line => line.trim() !== '');
      const isList = lines.some(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
      
      if (isList) {
        return (
          <ul className="list-disc pl-4 space-y-1.5 mt-1 marker:text-[#D23731]">
            {lines.map((line, idx) => {
              const cleanLine = line.trim().replace(/^[-•]\s*/, '');
              if (!cleanLine) return null;
              return (
                <li key={idx} className="text-sm text-gray-900 dark:text-gray-100 font-bold leading-snug text-justify">
                  {cleanLine}
                </li>
              );
            })}
          </ul>
        );
      }
      return <p className="text-sm text-gray-900 dark:text-gray-100 font-bold leading-snug whitespace-pre-line mt-1">{text}</p>;
    };

    return (
      <div className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-gray-800/50 rounded-sm border border-gray-100 dark:border-gray-800 transition-all hover:border-[#D23731]/40">
        <div className="p-2 bg-red-100/50 dark:bg-red-900/30 text-[#D23731] rounded-sm shrink-0 mt-0.5">
          <Icon size={18} />
        </div>
        <div className="flex-1 w-full">
          <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</p>
          {renderValue(value)}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-900 rounded-sm w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300 border-t-4 border-[#D23731]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-red-900/40 rounded-sm transition-colors group"
        >
          <X size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-[#D23731]" />
        </button>

        <div className="w-full md:w-2/5 bg-gray-50 dark:bg-gray-800/50 p-8 flex flex-col items-center border-r border-gray-200 dark:border-gray-800 overflow-y-auto custom-scrollbar">
          
          {device.image_url ? (
            <img src={device.image_url} alt={device.model} className="w-full h-auto object-contain max-h-80 drop-shadow-xl mt-8" />
          ) : (
            <div className="w-48 h-64 bg-gray-200 dark:bg-gray-700 rounded-sm flex flex-col gap-3 items-center justify-center shadow-inner text-gray-400 mt-8">
              <Smartphone size={48} />
              <span className="font-black uppercase tracking-wider text-sm">No Image</span>
            </div>
          )}

          {/* BOX DAFTAR VARIAN HARGA */}
          <div className="w-full mt-8">
            <h4 className="font-black text-sm text-gray-400 uppercase tracking-widest mb-3">Varian & Harga Resmi</h4>
            {device.prices && device.prices.length > 0 ? (
              <div className="space-y-2">
                {device.prices.map((varian, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-sm">
                    <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{varian.storage}</span>
                    <span className="font-black text-[#D23731]">Rp {varian.price.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 text-[#D23731] font-bold p-3 text-center rounded-sm border border-red-100 dark:border-red-900/50">
                Harga Belum Tersedia (TBA)
              </div>
            )}
          </div>
          
        </div>

        <div className="w-full md:w-3/5 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <span className="px-3 py-1 bg-red-100/50 dark:bg-red-900/40 text-[#D23731] text-xs font-black uppercase tracking-widest rounded-sm border border-red-200 dark:border-red-900">
              {device.brand}
            </span>
            <h2 className="text-3xl font-black mt-4 text-gray-900 dark:text-white uppercase tracking-tight">{device.model}</h2>
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
            <SpecItem icon={RefreshCw} label="Update" value={device.update_support} />
          </div>

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
