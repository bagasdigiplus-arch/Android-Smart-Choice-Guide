import Papa from 'papaparse';

export const fetchDevices = async () => {
  // PENTING: GANTI STRING INI DENGAN LINK PUBLISH TO WEB CSV ANDA YANG ASLI!
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

          let headerRowIndex = rows.findIndex(row => 
            row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes("tipe device"))
          );

          if (headerRowIndex !== -1) {
            let currentLabelCol = -1;
            let currentCategoryLabel = ""; // Menyimpan label dari baris 1 (Misal: "2 - 2.5 Juta")

            for (let c = 0; c < rows[headerRowIndex].length; c++) {
              // Membaca baris 1 (index 0). Jika ada teks, simpan sebagai kategori saat ini
              if (rows[0] && rows[0][c] && rows[0][c].trim() !== "") {
                currentCategoryLabel = rows[0][c].trim();
              }

              const cellValue = rows[headerRowIndex][c]?.trim();

              if (cellValue && cellValue.toLowerCase().includes("tipe device")) {
                currentLabelCol = c; 
              } else if (cellValue && currentLabelCol !== -1) {
                const modelName = cellValue;
                
                const device = {
                  id: modelName,
                  brand: modelName.split(' ')[0], 
                  model: modelName,
                  image_url: "", 
                  price: 0,
                  category: currentCategoryLabel, // <--- Data kategori dimasukkan ke sini
                  chipset: "",
                  ram_rom: "",
                  screen_size: "",
                  camera: "",
                  battery: "",
                  os: "",
                  network: "" // <--- Tambahan untuk jaringan
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
                  else if (label.includes("baterai")) device.battery = val;
                  else if (label.includes("jaringan") || label.includes("network")) device.network = val;
                }
                
                device.ram_rom = `${ram} / ${rom}`;
                devices.push(device);
              }
            }
          }
          resolve(devices);
        },
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};