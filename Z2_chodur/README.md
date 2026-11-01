# 2\. zadanie — Webové technológie (Z2\_chodur)

* **Meno a priezvisko:** Miroslav Chodúr
* **Krúžok / Skupina:** pondelok 11:00
* **Odkaz na stránku na školskom serveri: http://webte1.fei.stuba.sk/~xchodurm/Z2_chodur/

\---

## 🌐 O projekte

Stránka „Obedové menu v okolí fakulty“ načíta webové stránky troch reštaurácií, z každej spracuje denné menu a prehľadne ho zobrazí podľa dní v týždni. Riešenie beží výlučne na strane klienta (HTML, CSS, JavaScript) a má dve podstránky: **Menu** (`index.html`) a **O projekte** (`project.html`).

Hlavné funkcie:

* zobrazenie jedného dňa (pondelok – piatok) alebo celého týždňa naraz, predvolene aktuálny deň,
* filtrovanie podľa reštaurácie,
* ukladanie spracovaných dát do `localStorage` (stránky reštaurácií sa nenačítavajú pri každom otvorení, ak sú uložené dáta z dnešného dňa),
* tlačidlá „Aktualizovať menu“ a „Vymazať uložené dáta“, indikátor načítavania a čas poslednej aktualizácie pri každej reštaurácii,
* ošetrenie chýb: nedostupná stránka, zmenená štruktúra alebo chýbajúce menu sa zobrazí len v karte danej reštaurácie, ostatné fungujú ďalej,
* responzívne zobrazenie pre mobil, tablet aj desktop.

\---

## ⚙️ Ako to funguje

* Stránky sa načítavajú asynchrónne cez **Fetch API** a spracúvajú pomocou `DOMParser` a `querySelector` / `querySelectorAll`. Cudzí HTML sa do stránky nevkladá, zobrazujú sa len vybrané údaje cez `textContent`.
* Každá reštaurácia má vlastný parser, ktorý vracia jedlá v jednotnej štruktúre (`den`, `typ`, `nazov`, `cena`). Novú reštauráciu stačí pridať do poľa `RESTAURACIE` v `script.js` a napísať jej parser.
* Podľa zadania sa používajú **lokálne kópie** stránok v priečinku `data/` (načítavanie cez proxy sa nepoužíva).
* Keďže `fetch` nefunguje nad súbormi otvorenými cez `file://`, stránku treba spustiť cez webový server (napr. vstavaný server v IDE alebo školský server).

\---

## 🔗 Zdroje a licencie

* **Zdroje dát (menu reštaurácií):**

  * [Eat \& Meet](https://eatandmeet.sk/tyzdenne-menu)
  * [Naše Hospoda Karloveská](https://nasehospoda-karloveska.sk/#menu)
  * [Machnáč](https://machnac.sk/denneMenu.html)
* **CSS knižnica:** [Bootstrap 5.3](https://getbootstrap.com/) — licencovaný pod [MIT License](https://github.com/twbs/bootstrap/blob/main/LICENSE).
* **JavaScript knižnica:** [jQuery 3.7](https://jquery.com/) — licencovaná pod [MIT License](https://jquery.org/license/).
* **Fonty:** Lokálne hostovaný font **Inter** (Regular a Bold) integrovaný cez `@font-face` z priečinka `fonts/`. Licencia: [SIL Open Font License 1.1](https://openfontlicense.org/).
* **Favicon:** vlastná ikona (`favicon.ico`) vytvorená pre tento projekt.

\---

## 🤖 Použitie AI nástrojov

Pri tvorbe projektu bol použitý AI asistent (Claude od Anthropic) na konzultáciu pri zadaní.

