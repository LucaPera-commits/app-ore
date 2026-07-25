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
      message: 'Configurazione Nextcloud mancante. Verificare NEXTCLOUD_URL, NEXTCLOUD_USER e NEXTCLOUD_PASS su Vercel.' 
    });
  }

  const baseUrl = ncUrl.replace(/\/$/, '');
  const authHeader = 'Basic ' + Buffer.from(`${ncUser}:${ncPass}`).toString('base64');

  try {
    // MODALITÀ 1: Ricerca Globale per Parola Chiave
    if (query && query.trim().length >= 2) {
      const searchApiUrl = `${baseUrl}/ocs/v2.php/search/providers/files/search?term=${encodeURIComponent(query)}`;
      const response = await fetch(searchApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'OCS-APIRequest': 'true',
          'Accept': 'application/json'
        }
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

    // MODALITÀ 2: Esplorazione Istantanea Cartella (WebDAV)
    const cleanFolder = (folder || '').replace(/^\/+|\/+$/g, '');
    const webdavUrl = `${baseUrl}/remote.php/dav/files/${encodeURIComponent(ncUser)}/${cleanFolder ? cleanFolder + '/' : ''}`;

    const response = await fetch(webdavUrl, {
      method: 'PROPFIND',
      headers: {
        'Authorization': authHeader,
        'Depth': '1',
        'Content-Type': 'application/xml'
      }
    });

    if (!response.ok) {
      throw new Error(`Impossibile accedere alla cartella su Nextcloud (Status: ${response.status})`);
    }

    const xmlText = await response.text();
    const items = [];
    const responseMatches = xmlText.match(/<[a-zA-Z0-9]+:response[\s\S]*?<\/[a-zA-Z0-9]+:response>/gi) || [];

    responseMatches.forEach(respXml => {
      const hrefMatch = respXml.match(/<[a-zA-Z0-9]+:href>(.*?)<\/[a-zA-Z0-9]+:href>/i);
      if (!hrefMatch) return;
      
      let rawHref = decodeURIComponent(hrefMatch[1]);
      const isFolder = /<[a-zA-Z0-9]+:collection\s*\/?>/i.test(respXml);

      const userPrefix = `/remote.php/dav/files/${ncUser}/`.toLowerCase();
      const userPrefixEnc = `/remote.php/dav/files/${encodeURIComponent(ncUser)}/`.toLowerCase();

      let relPath = rawHref;
      if (relPath.toLowerCase().startsWith(userPrefix)) {
        relPath = relPath.substring(userPrefix.length);
      } else if (relPath.toLowerCase().startsWith(userPrefixEnc)) {
        relPath = relPath.substring(userPrefixEnc.length);
      }

      relPath = relPath.replace(/^\/+|\/+$/g, '');

      // Ignora la cartella principale se stessa nella lista dei contenuti
      if (relPath.toLowerCase() === cleanFolder.toLowerCase()) return;

      let name = '';
      const nameMatch = respXml.match(/<[a-zA-Z0-9]+:displayname>(.*?)<\/[a-zA-Z0-9]+:displayname>/i);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1];
      } else {
        const parts = relPath.split('/');
        name = parts[parts.length - 1] || 'Elemento';
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
    console.error("Errore documenti Nextcloud:", error);
    return res.status(500).json({ message: 'Errore durante la lettura da Nextcloud', error: error.message });
  }
}
