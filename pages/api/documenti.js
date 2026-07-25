export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  const { query, folder } = req.query;
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ message: 'Inserire almeno 2 caratteri per la ricerca.' });
  }

  const ncUrl = process.env.NEXTCLOUD_URL;
  const ncUser = process.env.NEXTCLOUD_USER;
  const ncPass = process.env.NEXTCLOUD_PASS;

  if (!ncUrl || !ncUser || !ncPass) {
    return res.status(500).json({ 
      message: 'Configurazione Nextcloud mancante. Impostare NEXTCLOUD_URL, NEXTCLOUD_USER e NEXTCLOUD_PASS su Vercel.' 
    });
  }

  try {
    const baseUrl = ncUrl.replace(/\/$/, '');
    const authHeader = 'Basic ' + Buffer.from(`${ncUser}:${ncPass}`).toString('base64');

    // API Search di Nextcloud OCS
    const searchApiUrl = `${baseUrl}/ocs/v2.php/search/providers/files/search?term=${encodeURIComponent(query)}`;

    const response = await fetch(searchApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'OCS-APIRequest': 'true',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Risposta Nextcloud non valida (Status: ${response.status})`);
    }

    const json = await response.json();
    const results = json?.ocs?.data?.results || [];

    // Mappatura risultati
    let fileTrovati = results.map(item => ({
      id: item.id || item.fileid,
      nome: item.title,
      percorso: item.subline || '/',
      linkWeb: item.resourceUrl || `${baseUrl}/index.php/apps/files/?dir=${encodeURIComponent(item.subline || '/')}`,
      isFolder: item.attributes && item.attributes.type === 'folder'
    }));

    // Filtraggio mirato in base alla cartella selezionata dall'utente
    if (folder && folder !== 'Tutto' && folder !== '/') {
      const targetFolder = folder.toLowerCase().trim();
      fileTrovati = fileTrovati.filter(item => 
        (item.percorso || '').toLowerCase().includes(targetFolder)
      );
    }

    return res.status(200).json({ risultati: fileTrovati });

  } catch (error) {
    console.error("Errore ricerca Nextcloud:", error);
    return res.status(500).json({ message: 'Errore durante la ricerca su Nextcloud', error: error.message });
  }
}
