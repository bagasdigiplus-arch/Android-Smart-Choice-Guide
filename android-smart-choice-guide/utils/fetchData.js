import Papa from 'papaparse';

const formatDriveLink = (link) => {
  if (!link) return "";
  const url = link.trim();
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return `https://drive.google.com/uc?export=view&id=${idParamMatch[1]}`;
  return url; 
};

export const fetchDevices = async () => {
  const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZeCJ9MWj6KpPPEM5A6AN8ZWKiYXkISBe_LDd2Rg9057sk8BM9dGOagzZxHFyVEO9FZZPnjpCX5rWl/pub?gid=514180181&single=true&output=csv';
  
  // MENGGUNAKAN LINK HARGA TERBARU ANDA
  const priceCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZeCJ9MWj6KpPPEM5A6AN8ZWKiYXkISBe_LDd2Rg9057sk8BM9dGOagzZxHFyVEO9FZZPnjpCX5rWl/pub?gid=19220526&single=true&output=csv';

  try {
    const [responseSpec, responsePrice] = await Promise.all([
      fetch(sheetCsvUrl),
      fetch(priceCsvUrl)
    ]);

    const csvTextSpec = await responseSpec.text();
    const csvTextPrice = await responsePrice.text();

    return new Promise((resolve) => {
      Papa.parse(csvTextSpec, {
        header: false, 
        skipEmptyLines: true,
        complete: (resultsSpec) => {
          const rows = resultsSpec.data;
          let devices = [];
          const usageCategories = [];

          for (let i = 1; i <= 8; i++) {
            if (rows[i] && rows[i][0] && rows[i][0].trim() !== "") {
              usageCategories.push({
                name: rows[i][0].trim(),
                description: rows[i][1] ? rows[i][1].trim() : ""
              });
            }
          }

          let headerRowIndex = rows.findIndex(row => 
            row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes("tipe device"))
          );

          if (headerRowIndex !== -1) {
            let currentLabelCol = -1;
            let currentCategoryLabel = "";

            for (let c = 0; c < rows[headerRowIndex].length; c++) {
              if (rows[0] && rows[0][c] && rows[0][c].trim() !== "") {
                currentCategoryLabel = rows[0][c].trim();
              }

              const cellValue = rows[headerRowIndex][c]?.trim();

              if (cellValue && cellValue.toLowerCase().includes("tipe device")) {
                currentLabelCol = c; 
              } else if (cellValue && currentLabelCol !== -1) {
                const modelName = cellValue;
                const extractedBrand = (rows[1] && rows[1][c] && rows[1][c].trim() !== "") 
                                        ? rows[1][c].trim() 
                                        : modelName.split(' ')[0];
                
                const device = {
                  id: modelName,
                  brand: extractedBrand,
                  model: modelName,
                  image_url: "", 
                  prices: [], // UBAH: Dari price (angka tunggal) menjadi array penyimpan banyak harga
                  category: currentCategoryLabel,
                  chipset: "",
                  ram_rom: "",
                  screen_size: "",
                  camera: "",
                  front_camera: "",
                  battery: "",
                  os: "",
                  network: "",
                  sim: "",
                  charging: "",
                  durability: "",
                  material: "",
                  update_support: "",
                  features: "",
                  best_for: ""
                };

                let ram = "";
                let rom = "";

                for (let r = headerRowIndex + 1; r < rows.length; r++) {
                  const label = rows[r][currentLabelCol]?.trim().toLowerCase() || "";
                  const val = rows[r][c]?.trim();

                  if (!val) continue; 

                  if (val.includes("http://") || val.includes("https://") || val.includes("drive.google.com")) {
                    device.image_url = formatDriveLink(val);
                    continue; 
                  }

                  if (label.includes("tampilan")) device.screen_size = val;
                  else if (label.includes("chipset")) device.chipset = val;
                  else if (label.includes("os")) device.os = val;
                  else if (label.includes("memori")) rom = val;
                  else if (label.includes("ram")) ram = val;
                  else if (label.includes("utama") && label.includes("kamera")) device.camera = val;
                  else if (label.includes("depan") && label.includes("kamera")) device.front_camera = val;
                  else if (label.includes("baterai")) device.battery = val;
                  else if (label.includes("pengecasan")) device.charging = val;
                  else if (label.includes("ketahanan")) device.durability = val;
                  else if (label.includes("material")) device.material = val;
                  else if (label.includes("update")) device.update_support = val;
                  else if (label.includes("keunggulan")) device.features = val;
                  else if (label.includes("cocok untuk")) device.best_for = val;
                  else if (label.includes("sim")) device.sim = val;
                  else if (label.includes("jaringan") || label.includes("network")) device.network = val;
                  else if (label.includes("gambar") || label.includes("image") || label.includes("foto")) {
                    device.image_url = formatDriveLink(val);
                  }
                }
                
                device.ram_rom = `${ram} / ${rom}`;
                devices.push(device);
              }
            }
          }

          // FITUR BARU: Menarik Data Varian Harga (Berdasarkan Penyimpanan)
          Papa.parse(csvTextPrice, {
            header: false,
            skipEmptyLines: true,
            complete: (resultsPrice) => {
              const priceRows = resultsPrice.data;
              
              devices = devices.map(device => {
                let matchedPrices = [];
                // Pisahkan nama HP untuk logika pencarian
                const targetWords = device.model.toLowerCase().split(" ").filter(w => w.length > 1);

                // Mulai mencari dari baris ke-4 (index 3) sesuai data spreadsheet Anda
                for (let r = 3; r < priceRows.length; r++) {
                  const row = priceRows[r];
                  // Asumsi Kolom A (index 0) adalah nama HP-nya
                  const rowName = row[0] ? String(row[0]).toLowerCase() : "";
                  
                  // Jika nama baris mengandung semua kata kunci dari nama HP
                  const isMatch = targetWords.every(word => rowName.includes(word));

                  if (isMatch) {
                    // Karena data di kolom A-F, mari kita cari pasangan Storage & Harga
                    // Logika: Mencari sel yang mengandung kata 'GB'/'TB' dan mencari angka harganya
                    
                    let currentStorage = "Default";
                    let currentPrice = 0;

                    for (let c = 1; c < Math.min(row.length, 6); c++) { 
                      const cellValue = String(row[c]).trim();
                      if (!cellValue) continue;

                      // Jika sel ini mendeskripsikan varian penyimpanan (contoh: "4/64 GB")
                      if (cellValue.toLowerCase().includes("gb") || cellValue.toLowerCase().includes("tb") || cellValue.includes("/")) {
                         currentStorage = cellValue;
                      } 
                      // Jika sel berupa angka harga (contoh: "Rp 1.500.000")
                      else {
                        const cleanNum = cellValue.replace(/[^0-9]/g, '');
                        if (cleanNum.length >= 6) { // Asumsi minimal harga ratusan ribu
                          currentPrice = Number(cleanNum);
                          // Jika ketemu harga, langsung pasangkan dengan storage terakhir dan simpan
                          matchedPrices.push({
                            storage: currentStorage,
                            price: currentPrice
                          });
                          currentStorage = "Default"; // Reset untuk mencari varian berikutnya jika ada
                        }
                      }
                    }
                  }
                }
                return { ...device, prices: matchedPrices };
              });

              resolve({ devices, usageCategories });
            }
          });

        },
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return { devices: [], usageCategories: [] };
  }
};
