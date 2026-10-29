# Come funziona

## Il trucco Unicode

LinkedIn accetta solo testo semplice. Il "grassetto" che vedi nei post sono
lettere diverse: Unicode ha un blocco, *Mathematical Alphanumeric Symbols*
(U+1D400–U+1D7FF), con l'alfabeto latino ripetuto in grassetto, corsivo,
calligrafico, doppio tratto, monospazio e così via. Sono pensati per le formule
matematiche, ma qualsiasi font moderno li mostra.

| Stile | Lettera `a` | Code point |
|---|---|---|
| Grassetto sans | 𝗮 | U+1D5EE |
| Corsivo sans | 𝘢 | U+1D622 |
| Grassetto (con grazie) | 𝐚 | U+1D41A |
| Monospazio | 𝚊 | U+1D68A |

Sottolineato e barrato funzionano diversamente: dopo ogni lettera viene aggiunto
un diacritico combinante, U+0332 (̲) o U+0336 (̶).

### I "buchi" del blocco matematico

Alcune lettere esistevano già nel blocco *Letterlike Symbols* (U+2100–U+214F)
prima del blocco matematico, e Unicode non le ha duplicate. Il corsivo `h`, per
esempio, è U+210E (ℎ) e non U+1D455, che è vuoto. `formatter.js` ha una tabella
di eccezioni per ogni alfabeto.

### Lettere accentate

À, è, é non hanno una versione matematica. Il formatter le scompone (forma NFD:
`è` = `e` + U+0300), trasforma la lettera base e lascia l'accento come diacritico
combinante: `𝗲̀`.

### Cosa non viene mai trasformato

URL, `#hashtag` e `@menzioni` restano in testo normale anche dentro un
`**grassetto**`. LinkedIn li riconosce solo in ASCII: in Unicode smetterebbero di
essere cliccabili. Prima della formattazione vengono sostituiti con segnaposto
della *Private Use Area* (U+E000–U+F8FF) e rimessi al loro posto alla fine.

### Il conteggio dei caratteri

Una lettera matematica vale 1 code point ma 2 unità UTF-16. LinkedIn non
documenta quale dei due conti per il limite di 3000 caratteri, quindi l'app mostra
entrambi (`289–366 / 3000`) e l'avviso scatta sul valore più alto.

## Limiti da conoscere

- **Ricerca**: LinkedIn non indicizza il testo formattato. Chi cerca "marketing"
  non trova "𝗺𝗮𝗿𝗸𝗲𝘁𝗶𝗻𝗴".
- **Accessibilità**: i lettori di schermo leggono i caratteri matematici uno per
  uno o li saltano. Formatta poche parole chiave, non frasi intere.
- **Menzioni vere**: una `@menzione` che notifica la persona si crea solo
  nell'editor di LinkedIn, non incollando testo.

## Architettura

```
            src/ (PWA)
   index.html · app.js · formatter.js · sw.js
                 │
         scripts/build.mjs  ◄── version da package.json
        ┌────────┼─────────────────┐
        ▼        ▼                 ▼
    dist/pwa  dist/chrome      dist/firefox
              + extension/     + extension/
              service_worker   background.scripts
                               + gecko id
```

- **Una sola sorgente.** L'interfaccia esiste solo in `src/`. Il build crea
  `app.html` (scheda) e `popup.html` (popup) da `index.html`: toglie il manifest
  della PWA e aggiunge `extension.css` ed `extension.js`.
- **Niente script inline.** I browser bloccano gli script inline nelle pagine
  delle estensioni Manifest V3, quindi tutto il JavaScript sta in file `.js`.
- **Il service worker gira solo su http(s).** Nelle estensioni non serve: i file
  sono già locali.
- **Differenze tra Chrome e Firefox** solo nel `manifest.json`: Chrome usa
  `background.service_worker`, Firefox `background.scripts` più
  `browser_specific_settings.gecko` (id dell'estensione e dichiarazione che non
  raccoglie dati).
- **Precompilazione.** `…/#text=<testo codificato>` apre l'app già compilata. Il
  frammento dopo `#` non arriva mai al server. Il menu contestuale delle
  estensioni usa lo stesso meccanismo, e la PWA installata su Android lo usa come
  *share target*.

## Da dove viene

L'interfaccia si ispira ai formatter di testo per LinkedIn già esistenti, come
quello di Typegrow, ma il codice è scritto da zero partendo dallo standard
Unicode, senza leggere o riusare codice di terzi. Rispetto a quei tool aggiunge il
markup, la protezione di link/hashtag/menzioni, il supporto agli accenti, il
monospazio, il doppio conteggio e la funzione *Togli formattazione*.
