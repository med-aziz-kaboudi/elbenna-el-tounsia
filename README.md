# El Benna El Tounsia · البنة التونسية

Book-style website for the Tunisian restaurant **El Benna El Tounsia** in Carate Brianza (MB), Italy.
The whole site is an interactive book: the front cover is the restaurant logo, the inner pages are
the menu, and the back cover closes with the logo again. Pages flip like real paper, with drag,
swipe, arrow keys, and buttons.

## Features

- Realistic page-flip with draggable page corners (StPageFlip, vendored, no build step)
- Two-page spread on desktop, single page with swipe on mobile (fully responsive)
- Deep links to any page (`#p0` cover … `#p7` back cover)
- Keyboard navigation (← →), visible focus states, `aria-live` page indicator
- `prefers-reduced-motion` support
- Click-to-call numbers and Google Maps link on the order page

## Stack

Plain HTML + CSS + JavaScript. No framework, no build. Deployed on Vercel as a static site.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Menu

I piatti: Pollo Mosle, Pesce al Forno, Couscous Carne, Pasta Pollo, Kamounia Kebda, Mermez Carne.
Street food: Piatto/Panino Kafteji, Chapati Mahdia, Fricassè, Panino Merguez, Soufflé.
Consegna gratuita da 3 ordini. ☎ 380 104 6885 — Carate Brianza (MB).
