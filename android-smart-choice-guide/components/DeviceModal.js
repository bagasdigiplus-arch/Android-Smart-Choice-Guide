import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Camera, Battery, Cpu, MemoryStick } from 'lucide-react';

export default function DeviceModal({ device, isOpen, onClose }) {
	if (!isOpen || !device) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 20 }}
					className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
				>
					<button
						onClick={onClose}
						className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
					>
						<X size={20} className="text-gray-600 dark:text-gray-300" />
					</button>

					<div className="flex flex-col md:flex-row h-full max-h-[80vh] overflow-y-auto">
						<div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
							<img src={device.image_url} alt={device.model} className="max-h-80 object-contain drop-shadow-xl" />
						</div>

						<div className="md:w-1/2 p-8">
							<span className="text-blue-500 font-bold tracking-widest uppercase text-sm">{device.brand}</span>
							<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{device.model}</h2>
							<p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-6">
								Rp {Number(device.price).toLocaleString('id-ID')}
							</p>

							<div className="space-y-4">
								<SpecItem icon={<Cpu />} label="Chipset" value={device.chipset} />
								<SpecItem icon={<MemoryStick />} label="RAM/ROM" value={device.ram_rom} />
								<SpecItem icon={<Smartphone />} label="Screen" value={device.screen_size} />
								<SpecItem icon={<Camera />} label="Camera" value={device.camera} />
								<SpecItem icon={<Battery />} label="Battery" value={device.battery} />
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}

function SpecItem({ icon, label, value }) {
	return (
		<div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
			<div className="text-blue-500 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
				{icon}
			</div>
			<div>
				<p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
				<p className="font-semibold text-gray-800 dark:text-gray-200">{value}</p>
			</div>
		</div>
	);
}
