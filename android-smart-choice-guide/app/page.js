"use client";
import { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, Target } from 'lucide-react'; 
import { fetchDevices } from '@/utils/fetchData';
import DeviceCard from '@/components/DeviceCard';
import DeviceModal from '@/components/DeviceModal';

export default function Home() {
  const [devices, setDevices] = useState([]);
  const [usageCategories, setUsageCategories] = useState([]); 
  const [search, setSearch] = useState("");
  
  // STATE DIUBAH MENJADI ARRAY UNTUK MULTIPLE CHOICE
  const [selectedPriceCategories, setSelectedPriceCategories] = useState(["All"]);
  const [selectedUsages, setSelectedUsages] = useState(["All"]); 
  
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDevices();
      setDevices(data.devices || []);
      setUsageCategories(data.usageCategories || []);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const priceCategories = ["All", ...new Set(devices.map(d => d.category).filter(Boolean))];

  // LOGIKA MULTIPLE CHOICE UNTUK KATEGORI HARGA
  const togglePriceCategory = (category) => {
    if (category === "All") {
      setSelectedPriceCategories(["All"]); // Jika klik All, reset semua
      return;
    }

    let newSelected = selectedPriceCategories.filter(c => c !== "All");
    
    if (newSelected.includes(category)) {
      newSelected = newSelected.filter(c => c !== category); // Hapus jika sudah ada
    } else {
      newSelected.push(category); // Tambah jika belum ada
    }

    // Jika user menghapus semua centang, otomatis kembalikan ke "All"
    if (newSelected.length === 0) {
      setSelectedPriceCategories(["All"]);
    } else {
      setSelectedPriceCategories(newSelected);
    }
  };

  // LOGIKA MULTIPLE CHOICE UNTUK KEBUTUHAN PENGGUNAAN
  const toggleUsage = (usage) => {
    if (usage === "All") {
      setSelectedUsages(["All"]); // Jika klik Semua, reset semua
      return;
    }

    let newSelected = selectedUsages.filter(u => u !== "All");
    
    if (newSelected.includes(usage)) {
      newSelected = newSelected.filter(u => u !== usage);
    } else {
      newSelected.push(usage);
    }

    if (newSelected.length === 0) {
      setSelectedUsages(["All"]);
    } else {
      setSelectedUsages(newSelected);
    }
  };

  // LOGIKA FILTERING MULTIPLE ARRAY
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchSearch = device.model?.toLowerCase().includes(search.toLowerCase()) || 
                          device.brand?.toLowerCase().includes(search.toLowerCase());
      
      const matchPrice = selectedPriceCategories.includes("All") || 
                         selectedPriceCategories.includes(device.category);
      
      const matchUsage = selectedUsages.includes("All") || 
                         selectedUsages.some(usage => 
                           device.best_for && device.best_for.toLowerCase().includes(usage.toLowerCase())
                         );

      return matchSearch && matchPrice && matchUsage;
    });
  }, [devices, search, selectedPriceCategories, selectedUsages]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-[#D23731]" size={28} />
            <h1 className="text-2xl font-black bg-gradient-to-r from-[#D23731] to-[#8b0000] bg-clip-text text-transparent uppercase tracking-tight">
              Android Smart Choice
            </h1>
          </div>
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari HP impianmu..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-[#D23731] focus:bg-white dark:focus:bg-gray-900 rounded-sm outline-none transition-all font-medium"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR KIRI */}
        <aside className="w-full md:w-72 shrink-0">
          <div className="sticky top-28 bg-white dark:bg-gray-900 p-5 rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Target className="text-[#D23731]" size={20} />
              <h3 className="font-black text-[15px] text-[#D23731] uppercase tracking-wide">Kebutuhan Penggunaan</h3>
            </div>
            <ul className="space-y-1.5">
              <li>
                <button 
                  onClick={() => toggleUsage("All")} 
                  className={`w-full text-left px-3 py-2.5 rounded-sm text-sm font-bold transition-all border-l-4 ${
                    selectedUsages.includes("All") 
                      ? "bg-red-50 dark:bg-red-900/20 text-[#D23731] border-[#D23731]" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent"
                  }`}
                >
                  Semua Kebutuhan
                </button>
              </li>
              {usageCategories.map((cat, idx) => {
                const isSelected = selectedUsages.includes(cat.name);
                return (
                  <li key={idx}>
                    <button 
                      onClick={() => toggleUsage(cat.name)} 
                      className={`w-full flex flex-col text-left px-3 py-2.5 rounded-sm transition-all border-l-4 ${
                        isSelected 
                          ? "bg-red-50 dark:bg-red-900/20 border-[#D23731]" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent group"
                      }`}
                    >
                      <span className={`text-sm font-bold ${isSelected ? "text-[#D23731]" : "text-gray-700 dark:text-gray-300 group-hover:text-[#D23731]"}`}>
                        {cat.name}
                      </span>
                      {cat.description && (
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-1 leading-snug">
                          {cat.description}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* KONTEN KANAN */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            {priceCategories.map(category => {
              const isSelected = selectedPriceCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => togglePriceCategory(category)}
                  className={`px-4 py-2 rounded-sm whitespace-nowrap font-bold text-sm transition-all border ${
                    isSelected 
                      ? 'bg-[#D23731] text-white border-[#D23731] shadow-md' 
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#D23731] hover:text-[#D23731]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#D23731]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevices.length > 0 ? (
                filteredDevices.map(device => (
                  <DeviceCard key={device.id} device={device} onClick={setSelectedDevice} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm">
                  <Target size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 font-bold text-lg">Tidak ada HP yang cocok dengan filter Anda.</p>
                  <p className="text-gray-400 text-sm mt-1">Coba kurangi atau ubah beberapa pilihan filter Anda.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <DeviceModal isOpen={!!selectedDevice} device={selectedDevice} onClose={() => setSelectedDevice(null)} />
    </div>
  );
}