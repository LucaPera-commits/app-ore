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

  const fileUrl = `${baseUrl}/remote.php/dav/files/${encodeURIComponent(cleanUser)}/${path.replace(/^\/+/, '')}`;
  const authHeader = 'Basic ' + Buffer.from(`${cleanUser}:${cleanPass}`).toString('base64');

  try {
    const fileRes = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!fileRes.ok) {
      return res.status(fileRes.status).json({ message: 'Impossibile recuperare il file da Nextcloud' });
    }

    const fileName = path.split('/').pop();
    const ext = fileName.split('.').pop().toLowerCase();

    // Mappatura Tipi MIME per consultazione INLINE (senza download)
    let contentType = 'application/octet-stream';
    if (ext === 'pdf') contentType = 'application/pdf';
    else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    else if (ext === 'txt') contentType = 'text/plain; charset=utf-8';

    const buffer = Buffer.from(await fileRes.arrayBuffer());

    // FONDAMENTALE: Content-Disposition inline FORZA il browser ad aprirlo a schermo senza scaricarlo
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
    return res.send(buffer);

  } catch (error) {
    return res.status(500).json({ message: 'Errore durante la lettura del file', error: error.message });
  }
}
