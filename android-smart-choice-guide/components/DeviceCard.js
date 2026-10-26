import { motion } from 'framer-motion';
import { Cpu, MemoryStick } from 'lucide-react';

export default function DeviceCard({ device, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(device)}
      className="cursor-pointer bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
        {/* Fallback image jika URL kosong */}
        <img 
          src={device.image_url || "https://placehold.co/400x400?text=No+Image"} 
          alt={device.model} 
          className="object-contain h-full w-full mix-blend-multiply dark:mix-blend-normal p-2"
        />
      </div>
      
      <div className="flex-1">
        <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-1">{device.brand}</p>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{device.model}</h3>
        
        <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
            <MemoryStick size={14} /> {device.ram_rom}
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
            <Cpu size={14} /> {device.chipset}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <p className="text-xl font-extrabold text-gray-900 dark:text-white">
          Rp {Number(device.price).toLocaleString('id-ID')}
        </p>
      </div>
    </motion.div>
  );
}