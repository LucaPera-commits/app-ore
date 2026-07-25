export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  const { path, forceDownload } = req.query;
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

    // Mappatura Mime Types
    let contentType = 'application/octet-stream';
    if (ext === 'pdf') contentType = 'application/pdf';
    else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (ext === 'doc') contentType = 'application/msword';
    else if (ext === 'xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (ext === 'xls') contentType = 'application/vnd.ms-excel';

    const buffer = Buffer.from(await fileRes.arrayBuffer());

    const disposition = (forceDownload === 'true' || !['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'txt'].includes(ext))
      ? `attachment; filename="${encodeURIComponent(fileName)}"`
      : `inline; filename="${encodeURIComponent(fileName)}"`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', disposition);
    return res.send(buffer);

  } catch (error) {
    return res.status(500).json({ message: 'Errore durante la lettura del file', error: error.message });
  }
}
