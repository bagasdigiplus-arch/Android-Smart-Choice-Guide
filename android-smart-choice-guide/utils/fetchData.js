import Papa from 'papaparse';

export const fetchDevices = async () => {
  const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/1ZI_H6nuuGYXmDvq9Tp2XUbYeWIIK66hwnZK9tSzB89k/edit?gid=514180181#gid=514180181';

  try {
    const response = await fetch(sheetCsvUrl);
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
      });
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};