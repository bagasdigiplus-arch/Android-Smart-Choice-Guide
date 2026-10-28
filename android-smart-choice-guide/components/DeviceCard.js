import { Cpu, HardDrive, Image as ImageIcon } from 'lucide-react';

export default function DeviceCard({ device, onClick }) {
  return (
    <div 
      onClick={() => onClick(device)}
      className="bg-white dark:bg-gray-900 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-[#D23731]/60 transition-all cursor-pointer flex flex-col h-full overflow-hidden group"
    >
      <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
        {device.image_url ? (
          <img src={device.image_url} alt={device.model} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon size={48} className="mb-2 opacity-50" />
            <span className="font-bold text-sm uppercase tracking-wider">No Image</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <p className="text-[#D23731] font-black text-xs uppercase tracking-widest mb-1">
          {device.brand}
        </p>
        <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100 leading-tight mb-4 line-clamp-2 uppercase">
          {device.model}
        </h3>

        <div className="mt-auto space-y-2 mb-4">
          {device.ram_rom && (
            <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-sm text-xs font-semibold text-gray-700 dark:text-gray-300">
              <HardDrive size={14} className="shrink-0 mt-0.5 text-gray-400" />
              <span className="line-clamp-2 leading-snug">{device.ram_rom}</span>
            </div>
          )}
          {device.chipset && (
            <div className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-sm text-xs font-semibold text-gray-700 dark:text-gray-300">
              <Cpu size={14} className="shrink-0 mt-0.5 text-gray-400" />
              <span className="line-clamp-2 leading-snug">{device.chipset}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {device.price > 0 ? `Rp ${Number(device.price).toLocaleString('id-ID')}` : "Harga TBA"}
          </p>
        </div>
      </div>
    </div>
  );
}