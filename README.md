# Branch `landing`

> ⚠️ **Questo branch non va MAI unito a `main`.** Non ha storia in comune con `main`
> e la CI di `main` fa fallire qualsiasi PR che parte da qui.

Contiene solo il sito pubblicato su **https://linkedinformatter.smzstudio.it**:

| Percorso | Cosa | Da dove arriva |
|---|---|---|
| `/` | La landing page | `landing/` di questo branch |
| `/app/` | La PWA | build del codice dell'ultima release di `main` |

```
landing/
  index.html  styles.css  landing.js   pagina, stile, prova dal vivo nell'hero
  img/                                  icona, og.png, icone degli altri progetti
.github/workflows/pages.yml             build e deploy su GitHub Pages
```

## Come si aggiorna

- **Landing**: modifica i file in `landing/` e fai push su `landing`. Il workflow
  `pages.yml` ripubblica il sito.
- **App**: non si tocca qui. Quando su `main` esce una release, il workflow
  *Release* avvia `pages.yml` e il sito prende la nuova versione della PWA.
  La versione nel footer (`__VERSION__`) viene sostituita in automatico.

La prova dal vivo nell'hero usa `app/formatter.js`, cioè lo stesso formatter della PWA.

## Anteprima in locale

Ricrea la struttura del sito pubblicato, con l'app in `app/`:

```bash
# dal checkout di main
npm run build -- --no-zip
mkdir -p /tmp/site && cp -R ../linkedin-formatter-landing/landing/. /tmp/site/ && cp -R dist/pwa /tmp/site/app
npx serve /tmp/site
```

## Altri progetti di @savez

Il footer elenca gli altri progetti con lo stesso testo e lo stesso ordine delle
landing di NonAbbocco, Bacco e Fidelity Card. Se ne aggiungi uno, aggiornale tutte.
