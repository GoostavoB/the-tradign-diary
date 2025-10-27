import * as XLSX from 'xlsx';

export interface SpreadsheetParseResult {
  headers: string[];
  rows: Record<string, any>[];
  sheetNames: string[];
  selectedSheet: string;
}

/**
 * Detects if a file is likely an Excel file based on extension or content signature
 */
export function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.xlsm');
}

/**
 * Parses Excel files (.xlsx, .xls) into structured data
 */
export async function parseSpreadsheet(
  file: File,
  sheetIndex: number = 0
): Promise<SpreadsheetParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        // Read workbook from binary data
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error('No sheets found in workbook'));
          return;
        }

        // Get requested sheet (or first sheet by default)
        const sheetName = workbook.SheetNames[sheetIndex] || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: '', // Default empty cells to empty string
          raw: false  // Format values as strings (dates, numbers, etc.)
        });

        if (jsonData.length === 0) {
          reject(new Error('Sheet is empty'));
          return;
        }

        // Extract headers from first row keys
        const headers = Object.keys(jsonData[0] as object);
        
        // Convert to Record format with proper typing
        const rows = jsonData.map(row => {
          const record: Record<string, any> = {};
          Object.entries(row as object).forEach(([key, value]) => {
            // Clean up Excel artifacts
            record[key] = cleanExcelValue(value);
          });
          return record;
        });

        resolve({
          headers,
          rows,
          sheetNames: workbook.SheetNames,
          selectedSheet: sheetName
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Clean and normalize Excel values
 */
function cleanExcelValue(value: any): any {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle Excel serial date numbers (e.g., 45000 = 2023-02-15)
  if (typeof value === 'number' && value > 25569 && value < 60000) {
    // Likely an Excel date serial number
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0).toISOString();
    }
  }

  return value;
}

/**
 * Parse numeric values that may have thousands separators or different decimal formats
 */
export function parseFlexibleNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const str = String(value).trim();
  
  // Remove thousands separators (comma, space, apostrophe)
  let cleaned = str.replace(/[,'\s]/g, '');
  
  // Handle European decimal format (1.234,56 -> 1234.56)
  if (cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}