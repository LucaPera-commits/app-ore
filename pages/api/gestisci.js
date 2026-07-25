// Modifica lo stato in ANNULLATO nel DB anziché cancellarlo
  if (req.method === 'DELETE') {
    const { id, calendar_event_id } = req.body;
    if (!id) return res.status(400).json({ message: "ID mancante" });

    // 1. Sposta in archivio sul Database (stato = annullato)
    const { error: dbError } = await supabase
      .from('eventi_ore')
      .update({ stato: 'annullato' })
      .eq('id', id);

    if (dbError) {
      return res.status(500).json({ message: "Errore durante l'annullamento nel DB.", error: dbError.message });
    }

    // 2. Segna l'evento come ANNULLATO su Google Calendar
    if (calendar_event_id && calendarId) {
      try {
        const calendar = await getGoogleCalendar();
        if (calendar) {
          const eventRes = await calendar.events.get({ calendarId, eventId: calendar_event_id });
          let nuovoTitolo = eventRes.data.summary || '';
          nuovoTitolo = nuovoTitolo.replace(/^(✅ |❌ )/g, '').trim();
          
          await calendar.events.patch({
            calendarId,
            eventId: calendar_event_id,
            requestBody: { summary: `❌ [ANNULLATO] ${nuovoTitolo}` }
          });
        }
      } catch (calError) {
        console.error("Errore annullamento Calendar:", calError);
      }
    }

    return res.status(200).json({ message: "Attività annullata e archiviata." });
  }
