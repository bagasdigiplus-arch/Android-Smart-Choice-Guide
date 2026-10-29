import Papa from 'papaparse';

// FITUR BARU: Auto-Convert Link Google Drive Biasa Menjadi Direct Link
const formatDriveLink = (link) => {
  if (!link) return "";
  const url = link.trim();
  
  // Ambil ID unik dari link Google Drive biasa (format: /file/d/ID/...)
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    // Mengubahnya menjadi link khusus untuk menampilkan gambar di website
    return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  }
  
  // Jika link sudah dalam format ID param (?id=...)
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${idParamMatch[1]}`;
  }
  
  // Jika bukan link Google Drive (misal link gambar dari web lain), biarkan apa adanya
  return url;
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
                
                // MENGAMBIL GAMBAR DARI BARIS 19 DAN LANGSUNG DI-CONVERT
                let extractedImage = "";
                if (rows[18] && rows[18][c] && rows[18][c].trim() !== "") {
                  extractedImage = formatDriveLink(rows[18][c]);
                }
                
                const device = {
                  id: modelName,
                  brand: extractedBrand,
                  model: modelName,
                  image_url: extractedImage, 
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

                for (let r = headerRowIndex + 1; r < rows.length; r++) {
                  const label = rows[r][currentLabelCol]?.trim().toLowerCase();
                  const val = rows[r][c]?.trim();

                  if (!label || !val) continue; 

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
                  // Jika ada baris bernama gambar di bawah, juga dikonversi otomatis
                  else if (label.includes("gambar") || label.includes("image") || label.includes("foto")) {
                    device.image_url = formatDriveLink(val);
                  }
                }
                
                device.ram_rom = `${ram} / ${rom}`;
                devices.push(device);
              }
            }
          }

          Papa.parse(csvTextPrice, {
            header: false,
            skipEmptyLines: true,
            complete: (resultsPrice) => {
              const priceRows = resultsPrice.data;
              
              devices = devices.map(device => {
                let matchedPrice = 0;
                for (let r = 0; r < priceRows.length; r++) {
                  const rowTextContent = priceRows[r].join(" ").toLowerCase();
                  const targetModelName = device.model.toLowerCase();

                  if (rowTextContent.includes(targetModelName)) {
                    for (let c = 0; c < priceRows[r].length; c++) {
                      const cleanNumberStr = String(priceRows[r][c]).replace(/[^0-9]/g, '');
                      if (cleanNumberStr.length > 5) {
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
