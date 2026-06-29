/**
 * src/lib/ipfs.js
 * IPFS upload and retrieval helpers for TrueServe
 *
 * Uses Pinata for IPFS pinning.
 */

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || '';
const PINATA_API = 'https://api.pinata.cloud';
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs'; // Default pinata gateway

/**
 * Convert an ipfs:// URI to an HTTP gateway URL
 * @param {string} ipfsUri  e.g. "ipfs://Qm..."
 * @returns {string}        e.g. "https://gateway.pinata.cloud/ipfs/Qm..."
 */
export function ipfsToHttp(ipfsUri) {
  if (!ipfsUri) return '';
  if (ipfsUri.startsWith('ipfs://')) {
    return `${IPFS_GATEWAY}/${ipfsUri.slice(7)}`;
  }
  // Already an HTTP URL or bare CID
  if (ipfsUri.startsWith('http')) return ipfsUri;
  return `${IPFS_GATEWAY}/${ipfsUri}`;
}

/**
 * Upload a JSON object to IPFS via Pinata
 * @param {object} data  Any JSON-serialisable object
 * @returns {Promise<string>}  ipfs:// URI  e.g. "ipfs://Qm..."
 */
export async function uploadToIPFS(data) {
  try {
    const response = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: { name: 'TrueServe_Campaign_Data.json' }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Pinata JSON upload failed (${response.status}): ${errText}`);
    }

    const result = await response.json();
    const cid = result.IpfsHash;
    if (!cid) throw new Error('No CID returned from Pinata');

    return `ipfs://${cid}`;
  } catch (error) {
    console.error('uploadToIPFS error:', error);
    throw new Error(`IPFS JSON upload failed: ${error.message}`);
  }
}

/**
 * Upload a File object to IPFS via Pinata (Images/Videos)
 * @param {File} file  The file to upload
 * @returns {Promise<string>}  ipfs:// URI
 */
export async function uploadFileToIPFS(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataMetadata', JSON.stringify({ name: file.name || 'TrueServe_Media' }));

    const response = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Pinata File upload failed (${response.status}): ${errText}`);
    }

    const result = await response.json();
    const cid = result.IpfsHash;
    if (!cid) throw new Error('No CID returned from Pinata');

    return `ipfs://${cid}`;
  } catch (error) {
    console.error('uploadFileToIPFS error:', error);
    throw new Error(`IPFS File upload failed: ${error.message}`);
  }
}

/**
 * Fetch and parse JSON from an IPFS hash or ipfs:// URI
 * @param {string} hashOrUri  CID, ipfs:// URI, or HTTP URL
 * @returns {Promise<object>}
 */
export async function fetchFromIPFS(hashOrUri) {
  if (!hashOrUri) return null;

  const url = ipfsToHttp(hashOrUri);

  try {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) {
      throw new Error(`Gateway fetch failed (${response.status}) for ${url}`);
    }
    return await response.json();
  } catch (error) {
    // Fallback to ipfs.io public gateway
    try {
      const cid = hashOrUri.startsWith('ipfs://') ? hashOrUri.slice(7) : hashOrUri;
      const fallbackUrl = `https://ipfs.io/ipfs/${cid}`;
      const res = await fetch(fallbackUrl, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`ipfs.io fallback failed (${res.status})`);
      return await res.json();
    } catch (fallbackErr) {
      console.error('fetchFromIPFS error (all gateways failed):', fallbackErr);
      return null;
    }
  }
}
