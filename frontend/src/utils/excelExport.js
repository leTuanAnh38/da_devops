import * as XLSX from 'xlsx';

/**
 * Xuất dữ liệu ra file Excel
 * @param {Array} data - Mảng dữ liệu JSON
 * @param {string} fileName - Tên file xuất ra (không cần .xlsx)
 * @param {string} sheetName - Tên sheet trong Excel
 */
export const exportToExcel = (data, fileName = 'report', sheetName = 'Sheet1') => {
    try {
        // Tạo worksheet từ JSON
        const worksheet = XLSX.utils.json_to_sheet(data);
        
        // Tạo workbook mới
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        
        // Xuất file
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        
        return true;
    } catch (error) {
        console.error('Lỗi xuất Excel:', error);
        return false;
    }
};
