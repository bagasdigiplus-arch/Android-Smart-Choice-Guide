import Papa from 'papaparse';

export const fetchDevices = async () => {
  const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZeCJ9MWj6KpPPEM5A6AN8ZWKiYXkISBe_LDd2Rg9057sk8BM9dGOagzZxHFyVEO9FZZPnjpCX5rWl/pub?gid=514180181&single=true&output=csv';

  try {
    const response = await fetch(sheetCsvUrl);
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: false, 
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data;
          const devices = [];
          const usageCategories = [];

          // 1. MENGAMBIL DATA KATEGORI DARI KOLOM A & B (Baris 2 sampai 9 / Index 1-8)
          // Asumsi A1 adalah header "Kategori", jadi kita mulai dari baris ke-2
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
                
                // MENGAMBIL NAMA BRAND DARI BARIS 2 (Index 1)
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
                  best_for: "" // Ini yang akan dicocokkan dengan filter sidebar
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
          // KEMBALIKAN DATA DEVICES DAN KATEGORI BERSAMAAN
          resolve({ devices, usageCategories });
        },
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return { devices: [], usageCategories: [] };
  }
};