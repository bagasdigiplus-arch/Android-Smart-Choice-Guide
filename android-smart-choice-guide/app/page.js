"use client";
import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { fetchDevices } from '@/utils/fetchData';
import DeviceCard from '@/components/DeviceCard';
import DeviceModal from '@/components/DeviceModal';

export default function Home() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDevices();
      setDevices(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const brands = ["All", ...new Set(devices.map(d => d.brand).filter(Boolean))];

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchSearch = device.model?.toLowerCase().includes(search.toLowerCase()) || 
                          device.brand?.toLowerCase().includes(search.toLowerCase());
      const matchBrand = selectedBrand === "All" || device.brand === selectedBrand;
      return matchSearch && matchBrand;
    });
  }, [devices, search, selectedBrand]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Choice
          </h1>
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari HP impianmu..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-full outline-none transition-all"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {brands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
                selectedBrand === brand 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDevices.length > 0 ? (
              filteredDevices.map(device => (
                <DeviceCard key={device.id} device={device} onClick={setSelectedDevice} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-10">Pencarian tidak ditemukan.</p>
            )}
          </div>
        )}
      </main>

      <DeviceModal isOpen={!!selectedDevice} device={selectedDevice} onClose={() => setSelectedDevice(null)} />
    </div>
  );
}