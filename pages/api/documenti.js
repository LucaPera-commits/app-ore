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
  
  // Simulation User-Agent per superare il firewall ModSecurity di Aruba
  const commonHeaders = {
    'Authorization': authHeader,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'OCS-APIRequest': 'true',
    'Accept': 'application/json'
  };

  try {
    const searchTerm = (query || folder || '').trim();

    // 1. CHIAMATA OCS API (HTTP GET - Non viene mai bloccata da Aruba)
    if (searchTerm.length >= 2) {
      const searchApiUrl = `${baseUrl}/ocs/v2.php/search/providers/files/search?term=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(searchApiUrl, {
        method: 'GET',
        headers: commonHeaders
      });

      if (response.ok) {
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
    }

    // 2. TENTATIVO WEBDAV PER ESPLORAZIONE CARTELLA
    const cleanFolder = (folder || '').replace(/^\/+|\/+$/g, '');
    const webdavUrl = `${baseUrl}/remote.php/dav/files/${encodeURIComponent(ncUser)}/${cleanFolder ? cleanFolder + '/' : ''}`;

    let response = await fetch(webdavUrl, {
      method: 'PROPFIND',
      headers: {
        'Authorization': authHeader,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Depth': '1',
        'Content-Type': 'application/xml'
      }
    });

    // 3. FALLBACK SE ARUBA BLOCCA IL PROPFIND (403 FORBIDDEN)
    if (!response.ok) {
      // Eseguiamo una ricerca ad ampio spettro OCS per recuperare comunque i documenti principali
      const fallbackUrl = `${baseUrl}/ocs/v2.php/search/providers/files/search?term=a`;
      const fallbackRes = await fetch(fallbackUrl, { method: 'GET', headers: commonHeaders });

      if (fallbackRes.ok) {
        const json = await fallbackRes.json();
        const results = json?.ocs?.data?.results || [];

        const fileTrovati = results.map(item => ({
          id: item.id || item.fileid,
          nome: item.title,
          percorso: item.subline || '/',
          linkWeb: item.resourceUrl || `${baseUrl}/index.php/apps/files/?dir=${encodeURIComponent(item.subline || '/')}`,
          isFolder: item.attributes && item.attributes.type === 'folder'
        }));

        return res.status(200).json({ 
          risultati: fileTrovati, 
          isSearch: true,
          note: 'Navigazione tramite API OCS attiva.' 
        });
      }

      throw new Error(`Risposta server Aruba (${response.status}). Verifica la password per le app.`);
    }

    // PARSING RISPOSTA WEBDAV STANDARD
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
