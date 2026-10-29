# Contribuire

Grazie di voler dare una mano! Ogni contributo conta: una segnalazione di bug,
un'idea, una correzione nella documentazione, un nuovo stile.

Partecipando accetti il [Codice di condotta](CODE_OF_CONDUCT.md).

## Prima di iniziare

- **Bug o idea?** Cerca tra le [issue](https://github.com/savez/linkedin-formatter/issues)
  se esiste già, altrimenti aprine una con il modello adatto.
- **Modifica grossa** (nuova funzione, cambio di comportamento del markup)? Apri
  prima una issue per parlarne: ti evita di lavorare su qualcosa che poi non entra.
- **Correzione piccola** (refusi, documentazione, bug evidente)? Vai direttamente di PR.

## Ambiente di sviluppo

Serve solo Node.js 20 o superiore. Non ci sono dipendenze da installare.

```bash
git clone https://github.com/<tuo-utente>/linkedin-formatter.git
cd linkedin-formatter
npm start        # http://localhost:5173, ricarica la pagina dopo ogni modifica
npm test
npm run build    # genera dist/ e controlla che il build funzioni
```

Per provare le estensioni carica `dist/chrome` o `dist/firefox` come descritto in
[docs/INSTALLAZIONE.md](docs/INSTALLAZIONE.md); dopo ogni `npm run build` ricaricale.

Il lint dell'estensione Firefox (lo stesso della CI) si lancia con `npm run lint:firefox`.

## Dove mettere le mani

| Vuoi cambiare… | File |
|---|---|
| Come viene trasformato il testo (markup, stili, conteggio) | `src/formatter.js` + test in `test/` |
| L'interfaccia | `src/index.html` (HTML e CSS), `src/app.js` |
| Solo il comportamento delle estensioni | `extension/` |
| Manifest delle estensioni o come vengono generate | `scripts/build.mjs` |

Regole che tengono in piedi il progetto:

- **Niente dipendenze né bundler.** JavaScript vanilla, compatibile con i browser
  moderni. Se pensi che serva una libreria, parliamone in una issue.
- **Niente script inline** in `index.html`: le estensioni Manifest V3 li bloccano.
- **Niente chiamate di rete.** L'app funziona offline e non invia il testo da nessuna parte.
- **Ogni modifica a `formatter.js` ha un test.** Se cambi il comportamento,
  aggiorna anche il porting Python nella skill di
  [savez/my-skills](https://github.com/savez/my-skills), o segnalalo nella PR.
- **L'interfaccia è in italiano.**

## Commit: Conventional Commits

I rilasci sono automatici: [release-please](https://github.com/googleapis/release-please)
legge i messaggi di commit per decidere la versione e scrivere il CHANGELOG. Per
questo i messaggi seguono i [Conventional Commits](https://www.conventionalcommits.org/it/):

```
<tipo>(<ambito facoltativo>): <descrizione all'imperativo>
```

| Tipo | Quando | Effetto sulla versione |
|---|---|---|
| `feat` | Nuova funzione | minor (1.**2**.0) |
| `fix` | Correzione di un bug | patch (1.1.**1**) |
| `perf` | Miglioramento delle prestazioni | patch |
| `docs` | Solo documentazione | nessuno, compare nel CHANGELOG |
| `refactor`, `test`, `ci`, `chore`, `style` | Tutto il resto | nessuno |

Un cambiamento che rompe la compatibilità (ad esempio un markup che cambia
significato) si segna con `!` dopo il tipo, `feat!: …`, oppure con una riga
`BREAKING CHANGE: …` nel corpo. Fa salire la versione major.

Esempi:

```
feat(markup): supporta ==evidenziato==
fix(estensione): il menu contestuale non compariva in Firefox
docs: aggiungi istruzioni per Edge
```

Le PR vengono unite con *squash*, quindi conta soprattutto il **titolo della PR**:
scrivilo nello stesso formato.

## Pull request

1. Fai un fork e crea un branch dal `main`: `git switch -c fix/conteggio-emoji`.
2. Fai le modifiche, con i test.
3. Verifica che `npm test` e `npm run build` passino.
4. Apri la PR compilando il modello: cosa cambia, perché, come l'hai provato.
   Per le modifiche visibili, uno screenshot aiuta molto.

La CI esegue test, build e lint dell'estensione Firefox: deve essere verde prima del merge.

## Come funziona un rilascio (per i maintainer)

1. Ogni merge su `main` aggiorna la PR *"chore(main): release x.y.z"* aperta da release-please.
2. Quando vuoi pubblicare, unisci quella PR.
3. Il workflow `Release` crea tag e release, costruisce PWA ed estensioni e allega
   `linkedin-formatter-{pwa,chrome,firefox}.zip`. Se nel repo ci sono i secret
   `AMO_JWT_ISSUER` e `AMO_JWT_SECRET` ([chiavi API di addons.mozilla.org](https://addons.mozilla.org/developers/addon/api/key/)),
   allega anche il `.xpi` di Firefox firmato.
