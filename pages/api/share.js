export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ message: 'Percorso file mancante' });
  }

  const rawUrl = process.env.NEXTCLOUD_URL || '';
  const rawUser = process.env.NEXTCLOUD_USER || '';
  const rawPass = process.env.NEXTCLOUD_PASS || '';

  const baseUrl = rawUrl.replace(/["']/g, '').replace(/\/$/, '').trim();
  let cleanUser = rawUser.replace(/["']/g, '').trim();
  if (cleanUser.includes('/')) {
    const parts = cleanUser.split('/').filter(Boolean);
    cleanUser = parts[parts.length - 1];
  }
  const cleanPass = rawPass.replace(/["'\s]/g, '').trim();

  const authHeader = 'Basic ' + Buffer.from(`${cleanUser}:${cleanPass}`).toString('base64');

  try {
    const cleanPath = path.replace(/^\/+/, '');
    
    // API OCS di Nextcloud per creare una condivisione link pubblica (shareType 3 = Public Link)
    const shareApiUrl = `${baseUrl}/ocs/v1.php/apps/files_sharing/api/v1/shares?format=json`;

    const bodyParams = new URLSearchParams({
      path: `/${cleanPath}`,
      shareType: '3', // Link Pubblico
      permissions: '1' // Sola Lettura
    });

    const response = await fetch(shareApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'OCS-APIRequest': 'true',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      body: bodyParams
    });

    const json = await response.json();

    if (response.ok && json?.ocs?.data?.url) {
      // Restituisce l'URL pubblico di consultazione senza password
      return res.status(200).json({ shareUrl: json.ocs.data.url });
    }

    // Se la condivisione esiste già, recuperiamo le condivisioni esistenti
    const getSharesUrl = `${baseUrl}/ocs/v1.php/apps/files_sharing/api/v1/shares?path=/${encodeURIComponent(cleanPath)}&format=json`;
    const getRes = await fetch(getSharesUrl, {
      headers: { 'Authorization': authHeader, 'OCS-APIRequest': 'true' }
    });
    const getJson = await getRes.json();
    const existingShare = getJson?.ocs?.data?.[0]?.url;

    if (existingShare) {
      return res.status(200).json({ shareUrl: existingShare });
    }

    // Fallback in caso di mancata creazione condivisione
    return res.status(500).json({ message: 'Impossibile generare il link di anteprima' });

  } catch (error) {
    return res.status(500).json({ message: 'Errore server condivisione', error: error.message });
  }
}
