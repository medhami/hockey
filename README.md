# Hokej – Rozhodčí na ledě (prototyp)

Tato jednoduchá webová hra simuluje roli rozhodčího v ledním hokeji. Hráč posuzuje situace a rozhoduje, zda jde o faul, a případně jaký.

## Jak spustit

1. Nahrajte celý obsah této složky do nového repozitáře na GitHubu.
2. V repozitáři přejděte do **Settings → Pages** a zvolte:
   - **Source**: Deploy from a branch
   - **Branch**: `main` a `/root`
3. Po chvíli GitHub vygeneruje veřejnou adresu (zobrazí se nahoře na stránce Settings → Pages).

## Jak přidat nové situace

- Otevřete `data/situations.json` a přidejte novou položku do pole.
- Vlastnosti položky:
  - `id`: jedinečný identifikátor (např. `sit3`)
  - `title`: krátký název
  - `mediaType`: `image` nebo `video`
  - `src`: cesta k souboru v `assets/`
  - `correctCall`: `no_foul` nebo typ faulu (`tripping`, `slashing`, `cross_checking`, `interference`, `high_stick`)
  - `foulOptions`: pole nabízených faulů pro danou situaci
  - `timeLimitMs`: limit v milisekundách pro automatické vyhodnocení jako "Bez faulu" při nečinnosti
  - `comment`: volitelný výukový komentář

## Přechod na video

- Změňte `mediaType` na `video` a `src` nastavte na cestu k videu (např. `assets/video/sit3.mp4`).
- V případě potřeby upravte logiku tak, aby vyhodnocovala až po skončení videa (viz komentáře ve `script.js`).

## Budoucí rozšíření

- Zvukové efekty (bučení), vibrace, časový tlak
- PWA režim pro offline běh a instalaci na tablet
- Stupně obtížnosti a detailnější statistiky
