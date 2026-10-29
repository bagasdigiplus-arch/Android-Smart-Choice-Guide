import Papa from 'papaparse';

// Fitur Auto-Convert Link Google Drive
const formatDriveLink = (link) => {
  if (!link) return "";
  const url = link.trim();
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return `https://drive.google.com/uc?export=view&id=${idParamMatch[1]}`;
  return url; // Kembalikan link asli jika bukan dari Google Drive
};

export const fetchDevices = async () => {
  const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZeCJ9MWj6KpPPEM5A6AN8ZWKiYXkISBe_LDd2Rg9057sk8BM9dGOagzZxHFyVEO9FZZPnjpCX5rWl/pub?gid=514180181&single=true&output=csv';
  const priceCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZeCJ9MWj6KpPPEM5A6AN8ZWKiYXkISBe_LDd2Rg9057sk8BM9dGOagzZxHFyVEO9FZZPnjpCX5rWl/pub?gid=394306194&single=true&output=csv';

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

          // Ambil daftar kategori dari baris atas
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
                  price: 0,
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

                // Mengekstrak Spesifikasi & Gambar Otomatis
                for (let r = headerRowIndex + 1; r < rows.length; r++) {
                  const label = rows[r][currentLabelCol]?.trim().toLowerCase() || "";
                  const val = rows[r][c]?.trim();

                  if (!val) continue; 

                  // SMART IMAGE DETECTOR: Jika isi teks berupa URL/Link, otomatis jadikan gambar
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
                }
                
                device.ram_rom = `${ram} / ${rom}`;
                devices.push(device);
              }
            }
          }

          // SMART PRICE MATCHER
          Papa.parse(csvTextPrice, {
            header: false,
            skipEmptyLines: true,
            complete: (resultsPrice) => {
              const priceRows = resultsPrice.data;
              
              devices = devices.map(device => {
                let matchedPrice = 0;
                // Pecah nama HP menjadi kata kunci untuk pencarian fleksibel (Misal: "Redmi", "A7", "Pro")
                const targetWords = device.model.toLowerCase().split(" ").filter(w => w.length > 1);

                for (let r = 0; r < priceRows.length; r++) {
                  const rowTextContent = priceRows[r].join(" ").toLowerCase();
                  
                  // Cek apakah SEMUA kata kunci nama HP muncul di baris harga tersebut
                  const isMatch = targetWords.every(word => rowTextContent.includes(word));

                  if (isMatch) {
                    for (let c = 0; c < priceRows[r].length; c++) {
                      // Bersihkan sel dari huruf dan titik, sisakan angkanya saja
                      const cleanNumberStr = String(priceRows[r][c]).replace(/[^0-9]/g, '');
                      // Asumsi harga HP minimum ratusan ribu rupiah (minimal 6 digit angka)
                      if (cleanNumberStr.length >= 6) {
                        matchedPrice = Number(cleanNumberStr);
                        break;
                      }
                    }
                  }
                  if (matchedPrice > 0) break;
                }
                return { ...device, price: matchedPrice };
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
