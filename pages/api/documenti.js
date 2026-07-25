export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  const { query, folder } = req.query;

  const ncUrl = process.env.NEXTCLOUD_URL;
  const ncUser = process.env.NEXTCLOUD_USER;
  const ncPass = process.env.NEXTCLOUD_PASS;

  if (!ncUrl || !ncUser || !ncPass) {
    return res.status(500).json({ 
      message: 'Configurazione Nextcloud mancante su Vercel (NEXTCLOUD_URL, NEXTCLOUD_USER, NEXTCLOUD_PASS).' 
    });
  }

  const baseUrl = ncUrl.replace(/\/$/, '');
  const authHeader = 'Basic ' + Buffer.from(`${ncUser}:${ncPass}`).toString('base64');
  
  // Intestazioni per superare i filtri WAF di Aruba
  const commonHeaders = {
    'Authorization': authHeader,
    'User-Agent': 'BW-Solutions-App/1.0 (Nextcloud Client)',
    'OCS-APIRequest': 'true'
  };

  try {
    // MODALITÀ 1: Ricerca Globale
    if (query && query.trim().length >= 2) {
      const searchApiUrl = `${baseUrl}/ocs/v2.php/search/providers/files/search?term=${encodeURIComponent(query)}`;
      const response = await fetch(searchApiUrl, {
        method: 'GET',
        headers: { ...commonHeaders, 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);
      const json = await response.json();
      const results = json?.ocs?.data?.results || [];

      const fileTrovati = results.map(item => ({
        id: item.id || item.fileid,
        nome: item.title,
        percorso: item.subline || '/',
        linkWeb: item.resourceUrl || `${baseUrl}/index.php/apps/files/?dir=${encodeURIComponent(item.subline || '/')}`,
        isFolder: item.attributes && item.attributes.type === 'folder'
      }));

      return res.status(200).json({ risultati: fileTrovati, isSearch: true });
    }

    // MODALITÀ 2: Esplorazione Istantanea Cartelle (WebDAV)
    const cleanFolder = (folder || '').replace(/^\/+|\/+$/g, '');
    
    // Prova 1: Endpoint specifico utente
    let webdavUrl = `${baseUrl}/remote.php/dav/files/${encodeURIComponent(ncUser)}/${cleanFolder ? cleanFolder + '/' : ''}`;

    let response = await fetch(webdavUrl, {
      method: 'PROPFIND',
      headers: { ...commonHeaders, 'Depth': '1', 'Content-Type': 'application/xml' }
    });

    // Prova 2: Endpoint generico se il primo restituisce 403/404
    if (!response.ok) {
      webdavUrl = `${baseUrl}/remote.php/webdav/${cleanFolder ? cleanFolder + '/' : ''}`;
      response = await fetch(webdavUrl, {
        method: 'PROPFIND',
        headers: { ...commonHeaders, 'Depth': '1', 'Content-Type': 'application/xml' }
      });
    }

    if (!response.ok) {
      throw new Error(`Accesso negato al Cloud Aruba (Codice: ${response.status}). Verifica la password per le app e il nome utente.`);
    }

    const xmlText = await response.text();
    const items = [];
    const responseMatches = xmlText.match(/<[a-zA-Z0-9]+:response[\s\S]*?<\/[a-zA-Z0-9]+:response>/gi) || [];

    responseMatches.forEach(respXml => {
      const hrefMatch = respXml.match(/<[a-zA-Z0-9]+:href>(.*?)<\/[a-zA-Z0-9]+:href>/i);
      if (!hrefMatch) return;
      
      let rawHref = decodeURIComponent(hrefMatch[1]);
      const isFolder = /<[a-zA-Z0-9]+:collection\s*\/?>/i.test(respXml);

      let relPath = rawHref;
      const parts = rawHref.split('/');
      const filesIndex = parts.findIndex(p => p.toLowerCase() === 'files' || p.toLowerCase() === 'webdav');
      
      if (filesIndex !== -1 && parts.length > filesIndex + 1) {
        // Rimuove i prefissi di sistema per isolare la cartella utente
        const offset = parts[filesIndex].toLowerCase() === 'files' ? 2 : 1;
        relPath = parts.slice(filesIndex + offset).join('/');
      }

      relPath = relPath.replace(/^\/+|\/+$/g, '');

      if (relPath.toLowerCase() === cleanFolder.toLowerCase()) return;

      let name = '';
      const nameMatch = respXml.match(/<[a-zA-Z0-9]+:displayname>(.*?)<\/[a-zA-Z0-9]+:displayname>/i);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1];
      } else {
        const pathParts = relPath.split('/');
        name = pathParts[pathParts.length - 1] || 'Elemento';
      }

      const linkWeb = `${baseUrl}/index.php/apps/files/?dir=/${encodeURIComponent(relPath)}`;

      items.push({
        id: relPath,
        nome: name,
        percorso: relPath,
        isFolder,
        linkWeb
      });
    });

    return res.status(200).json({ risultati: items, currentFolder: cleanFolder, isSearch: false });

  } catch (error) {
    console.error("Errore Fetch Nextcloud:", error);
    return res.status(500).json({ message: error.message || 'Errore durante la lettura da Nextcloud' });
  }
}
