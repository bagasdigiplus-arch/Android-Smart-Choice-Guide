import Papa from 'papaparse';

export const fetchDevices = async () => {
  // 1. LINK DATA UTAMA (SPEK) - Sudah dimasukkan
  const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZeCJ9MWj6KpPPEM5A6AN8ZWKiYXkISBe_LDd2Rg9057sk8BM9dGOagzZxHFyVEO9FZZPnjpCX5rWl/pub?gid=514180181&single=true&output=csv';
  
  // 2. LINK DATA HARGA - Sudah dimasukkan
  const priceCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZeCJ9MWj6KpPPEM5A6AN8ZWKiYXkISBe_LDd2Rg9057sk8BM9dGOagzZxHFyVEO9FZZPnjpCX5rWl/pub?gid=394306194&single=true&output=csv';

  try {
    // Tarik kedua data secara bersamaan (Parallel Fetching untuk kecepatan loading)
    const [responseSpec, responsePrice] = await Promise.all([
      fetch(sheetCsvUrl),
      fetch(priceCsvUrl)
    ]);

    const csvTextSpec = await responseSpec.text();
    const csvTextPrice = await responsePrice.text();

    return new Promise((resolve) => {
      // TAHAP 1: PARSING DATA SPESIFIKASI DAN KATEGORI
      Papa.parse(csvTextSpec, {
        header: false, 
        skipEmptyLines: true,
        complete: (resultsSpec) => {
          const rows = resultsSpec.data;
          let devices = [];
          const usageCategories = [];

          // Mengambil kategori penggunaan (Baris 2-9)
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
                  price: 0, // Akan diisi di Tahap 2
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
                }
                
                device.ram_rom = `${ram} / ${rom}`;
                devices.push(device);
              }
            }
          }

          // TAHAP 2: PARSING DATA HARGA & MENGGABUNGKANNYA
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

                return {
                  ...device,
                  price: matchedPrice
                };
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
