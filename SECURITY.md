# Sicurezza

## Versioni supportate

Le correzioni di sicurezza escono solo sull'ultima release.

## Segnalare una vulnerabilità

**Non aprire una issue pubblica.** Usa la
[segnalazione privata di GitHub](https://github.com/savez/linkedin-formatter/security/advisories/new):
la vede solo il maintainer.

Indica, se puoi:

- il componente (PWA, estensione Chrome, estensione Firefox) e la versione;
- i passaggi per riprodurre il problema;
- l'impatto che ti aspetti.

Riceverai una risposta entro 7 giorni. Una volta corretto il problema, se vuoi,
sarai citato nelle note di rilascio.

## Superficie di attacco

L'app non ha un server e non fa richieste di rete: il testo resta nel browser
(`localStorage`). L'estensione chiede solo il permesso `contextMenus` e non
inietta script nelle pagine. Le segnalazioni più utili riguardano quindi il
trattamento del testo in input (ad esempio contenuti che finiscono interpretati
come HTML) e i permessi delle estensioni.
