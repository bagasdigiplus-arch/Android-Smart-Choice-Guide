import Papa from 'papaparse';

export const fetchDevices = async () => {
  // GANTI STRING INI DENGAN LINK PUBLISH TO WEB CSV ANDA!
  const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQZeCJ9MWj6KpPPEM5A6AN8ZWKiYXkISBe_LDd2Rg9057sk8BM9dGOagzZxHFyVEO9FZZPnjpCX5rWl/pub?gid=514180181&single=true&output=csv';

  try {
    const response = await fetch(sheetCsvUrl);
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: false, // Dimatikan karena kita pakai format Matriks, bukan Tabel biasa
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data;
          const devices = [];

          // 1. Cari baris yang mengandung tulisan "Tipe Device"
          let headerRowIndex = rows.findIndex(row => 
            row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes("tipe device"))
          );

          if (headerRowIndex !== -1) {
            let currentLabelCol = -1;
            let currentPriceCategory = 0;

            // 2. Loop menyamping (setiap kolom) di baris Tipe Device tersebut
            for (let c = 0; c < rows[headerRowIndex].length; c++) {
              const cellValue = rows[headerRowIndex][c]?.trim();

              if (cellValue && cellValue.toLowerCase().includes("tipe device")) {
                currentLabelCol = c; // Tandai ini sebagai pilar label spesifikasi
              } else if (cellValue && currentLabelCol !== -1) {
                // Jika ini bukan kata "Tipe Device", berarti INI ADALAH NAMA HP
                const modelName = cellValue;
                
                // 3. Ekstrak Harga dari Kategori (Misal: "2 - 2.5 Juta" di baris atasnya)
                if (headerRowIndex > 0) {
                  for (let pc = c; pc >= currentLabelCol; pc--) {
                     const priceText = rows[headerRowIndex - 1][pc];
                     if (priceText && priceText.toLowerCase().includes("juta")) {
                         // Mengambil angka pertama dari teks "2 - 2.5 Juta" -> Menjadi 2.000.000
                         const matchNum = priceText.replace(',', '.').match(/\d+(\.\d+)?/);
                         if(matchNum) currentPriceCategory = parseFloat(matchNum[0]) * 1000000;
                         break;
                     }
                  }
                }

                // 4. Siapkan kerangka data HP
                const device = {
                  id: modelName,
                  brand: modelName.split(' ')[0], // Ambil kata pertama (REDMI, GALAXY, INFINIX)
                  model: modelName,
                  image_url: "", // Dibiarkan kosong agar pakai gambar fallback di UI
                  price: currentPriceCategory,
                  chipset: "",
                  ram_rom: "",
                  screen_size: "",
                  camera: "",
                  battery: "",
                  os: ""
                };

                let ram = "";
                let rom = "";

                // 5. Loop menurun untuk mengambil spek HP tersebut sesuai label di kirinya
                for (let r = headerRowIndex + 1; r < rows.length; r++) {
                  const label = rows[r][currentLabelCol]?.trim().toLowerCase();
                  const val = rows[r][c]?.trim();

                  if (!label || !val) continue; // Skip jika kosong

                  // Pencocokan keyword spesifikasi
                  if (label.includes("tampilan")) device.screen_size = val;
                  else if (label.includes("chipset")) device.chipset = val;
                  else if (label.includes("os")) device.os = val;
                  else if (label.includes("memori")) rom = val;
                  else if (label.includes("ram")) ram = val;
                  else if (label.includes("utama") && label.includes("kamera")) device.camera = val;
                  else if (label.includes("baterai")) device.battery = val;
                }
                
                // Gabungkan RAM dan Memori
                device.ram_rom = `${ram} / ${rom}`;
                
                // Masukkan HP ke dalam daftar final
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