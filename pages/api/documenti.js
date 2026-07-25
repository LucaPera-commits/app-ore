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
      message: 'Configurazione Nextcloud mancante. Verificare le chiavi su Vercel.' 
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

    // MODALITÀ 2: Esplorazione Istantanea Cartella (WebDAV Universale)
    const cleanFolder = (folder || '').replace(/^\/+|\/+$/g, '');
    
    // Usiamo l'endpoint webdav generico che non richiede l'ID utente esatto
    const webdavUrl = `${baseUrl}/remote.php/webdav/${cleanFolder ? cleanFolder + '/' : ''}`;

    const response = await fetch(webdavUrl, {
      method: 'PROPFIND',
      headers: {
        'Authorization': authHeader,
        'Depth': '1',
        'Content-Type': 'application/xml'
      }
    });

    if (!response.ok) {
      // Se fallisce, stampiamo il vero motivo nella console di Vercel per debug
      const errorText = await response.text();
      console.error("Errore WebDAV Nextcloud:", response.status, errorText);
      throw new Error(`Accesso negato al Cloud Aruba (Codice: ${response.status}). Verifica Utente e Password.`);
    }

    const xmlText = await response.text();
    const items = [];
    const responseMatches = xmlText.match(/<[a-zA-Z0-9]+:response[\s\S]*?<\/[a-zA-Z0-9]+:response>/gi) || [];

    responseMatches.forEach(respXml => {
      const hrefMatch = respXml.match(/<[a-zA-Z0-9]+:href>(.*?)<\/[a-zA-Z0-9]+:href>/i);
      if (!hrefMatch) return;
      
      let rawHref = decodeURIComponent(hrefMatch[1]);
      const isFolder = /<[a-zA-Z0-9]+:collection\s*\/?>/i.test(respXml);

      // Nextcloud restituisce il percorso in due modi possibili
      const prefix1 = `/remote.php/webdav/`.toLowerCase();
      const prefix2 = `/remote.php/dav/files/`.toLowerCase();

      let relPath = rawHref;
      const lowerHref = rawHref.toLowerCase();

      if (lowerHref.startsWith(prefix1)) {
        relPath = rawHref.substring(prefix1.length);
      } else if (lowerHref.startsWith(prefix2)) {
        // Se usa la sintassi dav/files/USERNAME/cartella, rimuoviamo tutta la parte iniziale inclusa l'username
        const parts = rawHref.split('/');
        const filesIndex = parts.findIndex(p => p.toLowerCase() === 'files');
        if (filesIndex !== -1 && parts.length > filesIndex + 2) {
          relPath = parts.slice(filesIndex + 2).join('/');
        }
      }

      relPath = relPath.replace(/^\/+|\/+$/g, '');

      // Ignora la cartella principale se stessa
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
    console.error("Errore Fetch Nextcloud:", error);
    return res.status(500).json({ message: error.message || 'Errore durante la lettura da Nextcloud' });
  }
}
