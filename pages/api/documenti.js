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
      message: 'Variabili mancanti su Vercel. Verifica NEXTCLOUD_URL, NEXTCLOUD_USER e NEXTCLOUD_PASS.' 
    });
  }

  const baseUrl = ncUrl.replace(/\/$/, '');
  const cleanUser = ncUser.trim();
  const cleanPass = ncPass.trim();
  const authHeader = 'Basic ' + Buffer.from(`${cleanUser}:${cleanPass}`).toString('base64');
  
  const commonHeaders = {
    'Authorization': authHeader,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'OCS-APIRequest': 'true',
    'Accept': 'application/json'
  };

  try {
    const cleanFolder = (folder || '').replace(/^\/+|\/+$/g, '');
    const searchTerm = (query || '').trim();

    // 1. SE È STATA RICHIESTA UNA RICERCA TESTUALE
    if (searchTerm.length >= 2) {
      const searchUrl = `${baseUrl}/ocs/v2.php/search/providers/files/search?term=${encodeURIComponent(searchTerm)}&format=json`;
      const searchRes = await fetch(searchUrl, { method: 'GET', headers: commonHeaders });
      
      if (searchRes.ok) {
        const json = await searchRes.json();
        const results = json?.ocs?.data?.results || [];

        const fileTrovati = results.map(item => ({
          id: item.id || item.fileid,
          nome: item.title,
          percorso: item.subline || '/',
          linkWeb: item.resourceUrl || `${baseUrl}/index.php/apps/files/?dir=${encodeURIComponent(item.subline || '/')}`,
          isFolder: item.attributes && item.attributes.type === 'folder'
        }));

        return res.status(200).json({ risultati: fileTrovati, isSearch: true });
      } else {
        const errText = await searchRes.text();
        return res.status(searchRes.status).json({ 
          message: `Errore Ricerca (Codice ${searchRes.status}): ${errText.slice(0, 100)}` 
        });
      }
    }

    // 2. ESPLORAZIONE CARTELLA WEBDAV
    const candidateUrls = [
      `${baseUrl}/remote.php/dav/files/${encodeURIComponent(cleanUser)}/${cleanFolder ? cleanFolder + '/' : ''}`,
      `${baseUrl}/index.php/remote.php/dav/files/${encodeURIComponent(cleanUser)}/${cleanFolder ? cleanFolder + '/' : ''}`,
      `${baseUrl}/remote.php/webdav/${cleanFolder ? cleanFolder + '/' : ''}`,
      `${baseUrl}/index.php/remote.php/webdav/${cleanFolder ? cleanFolder + '/' : ''}`
    ];

    let lastError = '';
    let lastStatus = 500;

    for (const url of candidateUrls) {
      try {
        const resDav = await fetch(url, {
          method: 'PROPFIND',
          headers: {
            ...commonHeaders,
            'Depth': '1',
            'Content-Type': 'application/xml'
          }
        });

        if (resDav.ok || resDav.status === 207) {
          const xmlText = await resDav.text();
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
        } else {
          lastStatus = resDav.status;
          lastError = await resDav.text();
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    // Se tutti i tentativi falliscono, restituiamo il codice HTTP reale
    return res.status(lastStatus).json({ 
      message: `Risposta Server Aruba (Codice ${lastStatus}): ${lastError ? lastError.slice(0, 100) : 'Connessione Rifiutata'}.` 
    });

  } catch (error) {
    console.error("Errore Fetch Nextcloud:", error);
    return res.status(500).json({ message: error.message || 'Errore durante la lettura da Nextcloud' });
  }
}
