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
  
  const commonHeaders = {
    'Authorization': authHeader,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'OCS-APIRequest': 'true',
    'Accept': 'application/json'
  };

  try {
    const cleanFolder = (folder || '').replace(/^\/+|\/+$/g, '');
    const searchTerm = (query || '').trim();

    // 1. CANDIDATI WEBDAV (Incluso il prefisso /index.php/ tipico di Aruba)
    const candidateWebdavUrls = [
      `${baseUrl}/remote.php/dav/files/${encodeURIComponent(ncUser)}/${cleanFolder ? cleanFolder + '/' : ''}`,
      `${baseUrl}/index.php/remote.php/dav/files/${encodeURIComponent(ncUser)}/${cleanFolder ? cleanFolder + '/' : ''}`,
      `${baseUrl}/remote.php/webdav/${cleanFolder ? cleanFolder + '/' : ''}`,
      `${baseUrl}/index.php/remote.php/webdav/${cleanFolder ? cleanFolder + '/' : ''}`
    ];

    let response = null;

    // Se non è una ricerca testuale, tentiamo i percorsi WebDAV per sfogliare le cartelle
    if (!searchTerm) {
      for (const url of candidateWebdavUrls) {
        try {
          const resDav = await fetch(url, {
            method: 'PROPFIND',
            headers: {
              ...commonHeaders,
              'Depth': '1',
              'Content-Type': 'application/xml'
            }
          });
          if (resDav.ok) {
            response = resDav;
            break;
          }
        } catch (e) {}
      }
    }

    // Se un endpoint WebDAV ha risposto con successo (200 OK)
    if (response && response.ok) {
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
    }

    // 2. FALLBACK RICERCA OCS (Incluso il prefisso /index.php/)
    const ocsUrls = [
      `${baseUrl}/ocs/v2.php/search/providers/files/search?term=${encodeURIComponent(searchTerm || 'a')}`,
      `${baseUrl}/index.php/ocs/v2.php/search/providers/files/search?term=${encodeURIComponent(searchTerm || 'a')}`
    ];

    for (const ocsUrl of ocsUrls) {
      try {
        const resOcs = await fetch(ocsUrl, { method: 'GET', headers: commonHeaders });
        if (resOcs.ok) {
          const json = await resOcs.json();
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
      } catch (e) {}
    }

    throw new Error('Impossibile reperire la struttura delle cartelle Nextcloud. Verifica NEXTCLOUD_URL su Vercel.');

  } catch (error) {
    console.error("Errore Fetch Nextcloud:", error);
    return res.status(500).json({ message: error.message || 'Errore durante la lettura da Nextcloud' });
  }
}
