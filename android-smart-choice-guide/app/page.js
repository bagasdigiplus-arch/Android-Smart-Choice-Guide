"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { fetchDevices } from "@/utils/fetchData";
import DeviceCard from "@/components/DeviceCard";
import DeviceModal from "@/components/DeviceModal";

type Device = Awaited<ReturnType<typeof fetchDevices>>[number];

export default function Home() {
	const [devices, setDevices] = useState<Device[]>([]);
	const [search, setSearch] = useState("");
	const [selectedBrand, setSelectedBrand] = useState("All");
	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			try {
				setDevices(await fetchDevices());
			} finally {
				setIsLoading(false);
			}
		};

		void loadData();
	}, []);

	const brands = [
		"All",
		...new Set(devices.map((device) => device.brand).filter(Boolean) as string[]),
	];

	const filteredDevices = useMemo(() => {
		const query = search.toLowerCase();
		return devices.filter((device) => {
			const matchesSearch =
				device.model?.toLowerCase().includes(query) ||
				device.brand?.toLowerCase().includes(query);
			const matchesBrand = selectedBrand === "All" || device.brand === selectedBrand;
			return matchesSearch && matchesBrand;
		});
	}, [devices, search, selectedBrand]);

	return (
		<div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
			<header className="sticky top-0 z-40 border-b border-gray-200 bg-white/70 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/70">
				<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row">
					<h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-extrabold text-transparent">
						Smart Choice
					</h1>
					<div className="relative w-full sm:w-96">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
							size={18}
							aria-hidden="true"
						/>
						<input
							type="search"
							placeholder="Cari HP impianmu..."
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							aria-label="Cari perangkat"
							className="w-full rounded-full border border-transparent bg-gray-100 py-2 pl-10 pr-4 outline-none transition-all focus:border-blue-500 focus:bg-white dark:bg-gray-800 dark:focus:bg-gray-900"
						/>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-4 py-8">
				<div className="mb-6 flex gap-2 overflow-x-auto pb-4 scrollbar-hide" aria-label="Filter merek">
					{brands.map((brand) => (
						<button
							key={brand}
							type="button"
							onClick={() => setSelectedBrand(brand)}
							aria-pressed={selectedBrand === brand}
							className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
								selectedBrand === brand
									? "bg-blue-600 text-white shadow-md"
									: "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
							}`}
						>
							{brand}
						</button>
					))}
				</div>

				{isLoading ? (
					<div className="flex justify-center py-20" role="status" aria-label="Memuat perangkat">
						<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{filteredDevices.length > 0 ? (
							filteredDevices.map((device) => (
								<DeviceCard key={device.id} device={device} onClick={setSelectedDevice} />
							))
						) : (
							<p className="col-span-full py-10 text-center text-gray-500">
								Pencarian tidak ditemukan.
							</p>
						)}
					</div>
				)}
			</main>

			<DeviceModal
				isOpen={!!selectedDevice}
				device={selectedDevice}
				onClose={() => setSelectedDevice(null)}
			/>
		</div>
	);
}
