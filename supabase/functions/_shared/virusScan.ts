import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHash } from "https://deno.land/std@0.224.0/crypto/mod.ts";

export interface VirusScanResult {
  clean: boolean;
  provider: 'virustotal' | 'clamav' | 'skipped';
  status: 'clean' | 'infected' | 'error' | 'skipped' | 'pending';
  details?: {
    positives?: number;
    total?: number;
    scanDate?: string;
    permalink?: string;
    vendors?: Record<string, { detected: boolean; result?: string }>;
  };
  errorMessage?: string;
}

/**
 * Calculate SHA-256 hash of file data
 */
async function calculateFileHash(fileData: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Scan file using VirusTotal API
 * Free tier: 4 requests/minute, 500 requests/day
 */
async function scanWithVirusTotal(
  fileData: Uint8Array,
  fileName: string
): Promise<VirusScanResult> {
  const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY');

  if (!apiKey) {
    console.warn('VirusTotal API key not configured - skipping scan');
    return {
      clean: true,
      provider: 'skipped',
      status: 'skipped',
      errorMessage: 'API key not configured'
    };
  }

  try {
    // Calculate file hash
    const fileHash = await calculateFileHash(fileData);

    // First, check if hash already scanned (saves quota)
    const reportUrl = `https://www.virustotal.com/api/v3/files/${fileHash}`;
    const reportResponse = await fetch(reportUrl, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey
      }
    });

    if (reportResponse.ok) {
      const reportData = await reportResponse.json();
      const stats = reportData.data.attributes.last_analysis_stats;

      return {
        clean: stats.malicious === 0 && stats.suspicious === 0,
        provider: 'virustotal',
        status: stats.malicious > 0 || stats.suspicious > 0 ? 'infected' : 'clean',
        details: {
          positives: stats.malicious + stats.suspicious,
          total: Object.values(stats).reduce((a: number, b: number) => a + b, 0),
          scanDate: reportData.data.attributes.last_analysis_date,
          permalink: `https://www.virustotal.com/gui/file/${fileHash}`,
          vendors: reportData.data.attributes.last_analysis_results
        }
      };
    }

    // If no existing report, upload file for scanning
    const formData = new FormData();
    const blob = new Blob([fileData], { type: 'application/octet-stream' });
    formData.append('file', blob, fileName);

    const uploadUrl = 'https://www.virustotal.com/api/v3/files';
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'x-apikey': apiKey
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`VirusTotal upload failed: ${error}`);
    }

    const uploadData = await uploadResponse.json();
    const analysisId = uploadData.data.id;

    // Wait for analysis (polling)
    // Note: In production, use webhooks or background job
    await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15s

    const analysisUrl = `https://www.virustotal.com/api/v3/analyses/${analysisId}`;
    const analysisResponse = await fetch(analysisUrl, {
      method: 'GET',
      headers: {
        'x-apikey': apiKey
      }
    });

    if (!analysisResponse.ok) {
      throw new Error('Failed to get analysis results');
    }

    const analysisData = await analysisResponse.json();
    const stats = analysisData.data.attributes.stats;

    return {
      clean: stats.malicious === 0 && stats.suspicious === 0,
      provider: 'virustotal',
      status: stats.malicious > 0 || stats.suspicious > 0 ? 'infected' : 'clean',
      details: {
        positives: stats.malicious + stats.suspicious,
        total: Object.values(stats).reduce((a: number, b: number) => a + b, 0),
        scanDate: new Date().toISOString(),
        permalink: `https://www.virustotal.com/gui/file/${fileHash}`
      }
    };

  } catch (error) {
    console.error('VirusTotal scan error:', error);
    return {
      clean: false,
      provider: 'virustotal',
      status: 'error',
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Scan file using ClamAV (requires ClamAV server)
 */
async function scanWithClamAV(fileData: Uint8Array): Promise<VirusScanResult> {
  const clamavHost = Deno.env.get('CLAMAV_HOST');
  const clamavPort = Deno.env.get('CLAMAV_PORT') || '3310';

  if (!clamavHost) {
    console.warn('ClamAV not configured - skipping scan');
    return {
      clean: true,
      provider: 'skipped',
      status: 'skipped',
      errorMessage: 'ClamAV not configured'
    };
  }

  try {
    // Connect to ClamAV daemon
    const conn = await Deno.connect({
      hostname: clamavHost,
      port: parseInt(clamavPort)
    });

    // Send INSTREAM command
    const encoder = new TextEncoder();
    await conn.write(encoder.encode('zINSTREAM\0'));

    // Send file size (4 bytes, big-endian)
    const sizeBuffer = new ArrayBuffer(4);
    const sizeView = new DataView(sizeBuffer);
    sizeView.setUint32(0, fileData.length, false);
    await conn.write(new Uint8Array(sizeBuffer));

    // Send file data
    await conn.write(fileData);

    // Send zero-length chunk (end marker)
    const endBuffer = new Uint8Array(4);
    await conn.write(endBuffer);

    // Read response
    const decoder = new TextDecoder();
    const responseBuffer = new Uint8Array(1024);
    const bytesRead = await conn.read(responseBuffer);
    const response = decoder.decode(responseBuffer.subarray(0, bytesRead || 0));

    conn.close();

    // Parse response: "stream: OK" or "stream: <virus name> FOUND"
    const isClean = response.includes('OK') && !response.includes('FOUND');

    return {
      clean: isClean,
      provider: 'clamav',
      status: isClean ? 'clean' : 'infected',
      details: {
        positives: isClean ? 0 : 1,
        total: 1
      },
      errorMessage: isClean ? undefined : response
    };

  } catch (error) {
    console.error('ClamAV scan error:', error);
    return {
      clean: false,
      provider: 'clamav',
      status: 'error',
      errorMessage: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Scan file for viruses using available provider
 */
export async function scanFile(
  fileData: Uint8Array,
  fileName: string,
  options?: {
    provider?: 'virustotal' | 'clamav' | 'auto';
    skipOnError?: boolean;
  }
): Promise<VirusScanResult> {
  const provider = options?.provider || 'auto';
  const skipOnError = options?.skipOnError !== false; // Default: true

  let result: VirusScanResult;

  if (provider === 'virustotal' || provider === 'auto') {
    result = await scanWithVirusTotal(fileData, fileName);
    if (result.status !== 'skipped' && result.status !== 'error') {
      return result;
    }
  }

  if (provider === 'clamav' || provider === 'auto') {
    result = await scanWithClamAV(fileData);
    if (result.status !== 'skipped' && result.status !== 'error') {
      return result;
    }
  }

  // No scanner available or all failed
  if (skipOnError) {
    console.warn('Virus scan unavailable - allowing file through (skipOnError=true)');
    return {
      clean: true,
      provider: 'skipped',
      status: 'skipped',
      errorMessage: 'No virus scanner configured'
    };
  }

  return {
    clean: false,
    provider: 'skipped',
    status: 'error',
    errorMessage: 'Virus scan failed and skipOnError=false'
  };
}

/**
 * Log virus scan result to upload_audit_log
 */
export async function logVirusScan(
  supabase: SupabaseClient,
  userId: string,
  fileName: string,
  fileSize: number,
  fileMimeType: string,
  fileHash: string,
  scanResult: VirusScanResult,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await supabase.from('upload_audit_log').insert({
      user_id: userId,
      file_name: fileName,
      file_size: fileSize,
      file_mime_type: fileMimeType,
      file_hash: fileHash,
      virus_scan_status: scanResult.status,
      virus_scan_provider: scanResult.provider,
      virus_scan_result: scanResult.details || {},
      processing_status: scanResult.clean ? 'pending' : 'failed',
      error_message: scanResult.errorMessage,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (error) {
    console.error('Failed to log virus scan:', error);
  }
}
