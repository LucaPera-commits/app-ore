await calendar.events.insert({
          calendarId: 'primary', // Assicura l'inserimento sul calendario principale di info@zoeanna.it
          requestBody: {
            summary: `${dipendente} - ${cliente} (${ore}h)`,
            description: `Progetto/Commessa: ${progetto}\nNote: ${note || 'Nessuna nota'}`,
            start: { date: data },
            end: { date: endDateStr },
            // Aggiunge l'evento direttamente anche sul tuo calendario personale!
            attendees: [
              { email: 'l.pera@zoeanna.it', responseStatus: 'accepted' }
            ]
          }
        });
