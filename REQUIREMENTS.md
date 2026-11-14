# Calorie-tracker — Requirements (concept v0.1)

> Status: v1.1, klaar voor bouw, samen op te stellen. Open punten staan onderaan (§9).
> Doel: dit document als startpunt aanbieden aan Claude Code.

## 1. Doel
Een persoonlijke web-app (PWA) waarmee ik op mijn telefoon dagelijks bijhoud wat ik eet en drink. Producten voeg ik toe door de barcode te scannen met de camera, of door ze te zoeken of handmatig in te voeren. Daarna kies ik een portie en ziet de app hoeveel calorieën, macro's (eiwit, koolhydraten, vet), vezels en water ik die dag binnen heb ten opzichte van mijn doelen.

## 2. Uitgangspunten
- **Platform:** Progressive Web App, alleen voor iPhone. Ik installeer de app via Safari met "Zet op beginscherm" en gebruik hem daarna als losse app. Testen gebeurt op iOS Safari; Android hoeft niet ondersteund te worden.
- **Gebruiker:** één persoon, geen accounts of login.
- **Opslag:** alleen lokaal op het toestel (IndexedDB). Geen eigen backend.
- **Taal:** Nederlands (UI-teksten); getallen in Nederlandse notatie (komma als decimaalteken).
- **Offline:** de app werkt offline voor alles behalve het opzoeken van nieuwe producten online.
- **Hosting:** GitHub Pages (gratis, via HTTPS, wat nodig is voor de camera). De code staat in een publieke GitHub-repository en wordt via een GitHub Actions-workflow automatisch gebouwd en gepubliceerd bij elke push naar `main`. Let op het subpad (`https://<gebruiker>.github.io/<repo>/`): `base` in Vite, het PWA-manifest en de service worker moeten daarop zijn ingesteld.

## 3. Functionele requirements

### 3.1 Product toevoegen
- **F1 — Barcode scannen:** camera openen (achtercamera), EAN-13/EAN-8/UPC-barcode herkennen en het product opzoeken. iOS Safari ondersteunt de `BarcodeDetector`-API niet, dus gebruik een bibliotheek zoals ZXing (`@zxing/browser`). De scanner moet ook werken als de app vanaf het beginscherm is geopend.
- **F1a — Na het scannen:** de app logt nooit automatisch. Na een geslaagde scan opent direct het portiescherm (F8–F11), met de laatst gebruikte portie al ingevuld. Met één tik op "Toevoegen" wordt de invoer gelogd.
- **F2 — Eerst lokaal opzoeken:** een barcode wordt eerst in de lokale productdatabase gezocht, daarna pas online.
- **F3 — Online opzoeken:** via de Open Food Facts API (`https://world.openfoodfacts.org/api/v2/product/{barcode}`). Overnemen: naam, merk, kcal, eiwit, koolhydraten, vet en vezels per 100 g/100 ml, plus de portiegrootte als die bekend is. Het product wordt daarna lokaal opgeslagen.
- **F4 — Niet gevonden of onvolledig:** een formulier openen om het product handmatig in te voeren of aan te vullen. De barcode is al ingevuld. Het product wordt lokaal opgeslagen.
- **F5 — Zoeken op naam:** zoeken in de eigen productdatabase, met favorieten en recent bovenaan.
- **F5a — Online zoeken in Open Food Facts:** als ik op "Zoek online" tik, zoekt de app in Open Food Facts, bij voorkeur naar producten die in Nederland verkocht worden. In de resultaten zie ik naam, merk en kcal per 100 g. Een gekozen product wordt lokaal opgeslagen en opent daarna het portiescherm.
  - De zoekfunctie van Open Food Facts heeft een strenge limiet op het aantal aanvragen. Zoek dus pas na een bevestiging (knop of Enter), niet bij elke toetsaanslag, en toon een nette melding als de limiet is bereikt of er geen verbinding is.
- **F6 — Handmatig invoeren zonder barcode:** voor bijvoorbeeld losse groente of iets uit een restaurant.
- **F7 — Product bewerken:** de voedingswaarden van een opgeslagen product achteraf corrigeren.
- **F7a — Snel kcal toevoegen:** alleen een aantal kcal invullen, zonder product (bijvoorbeeld bij uit eten). Een korte omschrijving en de macro's zijn optioneel. Er wordt geen product opgeslagen, alleen een logregel. Bereikbaar vanuit het Scan-scherm en via de "+" bij een maaltijd.

### 3.2 Porties
- **F8 — Hoeveelheid kiezen:** in gram of ml, óf in porties (bijvoorbeeld "1 plak", "1 schaaltje").
- **F9 — Eigen porties per product:** opslaan als naam + gewicht (bijvoorbeeld "1 boterham = 35 g"). Ook de portie van Open Food Facts wordt overgenomen als die bekend is.
- **F10 — Live berekening:** kcal en macro's worden direct herberekend terwijl ik de hoeveelheid aanpas.
- **F11 — Laatste portie onthouden:** de laatst gebruikte portie per product wordt als standaard voorgesteld.

### 3.3 Dagboek
- **F12 — Maaltijden:** elke invoer valt onder Ontbijt, Lunch, Diner of Tussendoor. De standaardkeuze hangt af van het tijdstip.
- **F13 — Dagoverzicht:** totalen per maaltijd en per dag (kcal, eiwit, koolhydraten, vet, vezels).
- **F14 — Invoer aanpassen:** een invoer bewerken (hoeveelheid, maaltijd), verwijderen of kopiëren naar een andere dag of maaltijd.
- **F14a — Ongedaan maken:** na het verwijderen van een invoer (of water, een product of een recept) verschijnt 5 seconden lang een toast met "Ongedaan maken", die de verwijdering terugdraait.
- **F15 — Andere dagen:** naar vorige en volgende dagen bladeren om terug te kijken of iets na te loggen.

### 3.4 Doelen en voortgang
- **F16 — Instellingen:** een dagdoel voor kcal, plus optionele doelen voor eiwit, koolhydraten, vet en vezels (in gram) en water (in ml). De startwaarden vul ik zelf in de app in; tot die tijd toont de app alleen totalen, zonder voortgangsbalk.
- **F17 — Voortgang:** een voortgangsbalk of ring op het hoofdscherm met "nog over" of "over het doel heen".

### 3.4a Weekoverzicht
- **F17a — Week in één scherm:** een scherm met de huidige week (maandag t/m zondag) en bladeren naar vorige weken.
- **F17b — Kcal per dag:** een staafdiagram met de kcal per dag en een lijn op de hoogte van het dagdoel (als dat is ingesteld).
- **F17c — Gemiddelden:** het gemiddelde per dag voor kcal, eiwit, koolhydraten, vet, vezels en water. Dagen zonder invoer tellen niet mee in het gemiddelde.
- **F17d — Naar een dag:** tikken op een dag opent het dagoverzicht van die dag.

### 3.5 Water
- **F18 — Snel water loggen:** knoppen voor bijvoorbeeld +250 ml en +500 ml, plus een eigen hoeveelheid. Ongedaan maken moet mogelijk zijn.
- **F19 — Water in het overzicht:** de waterstand per dag wordt getoond ten opzichte van het doel.

### 3.6 Favorieten en recent
- **F20 — Favorieten:** een product als favoriet markeren (ster).
- **F21 — Snel opnieuw toevoegen:** een lijst "Recent" met de laatst gebruikte producten, toe te voegen met één tik inclusief de laatste portie.
- **F22 — Maaltijd herhalen:** bijvoorbeeld "Ontbijt van gisteren".
- **F22a — Opgeslagen maaltijden:** een vaste combinatie van producten met hun hoeveelheden opslaan onder een naam, bijvoorbeeld "Mijn ontbijt" = yoghurt 150 g + muesli 45 g + banaan 1 stuk.
  - Vanuit een gevulde maaltijdkaart opslaan, of nieuw samenstellen.
  - Met één tik loggen: elk onderdeel wordt een eigen logregel, die je daarna nog los kunt aanpassen.
  - Het verschil met een recept: een recept wordt één gerecht met porties; een opgeslagen maaltijd blijft een set losse producten.
  - Te vinden onder Producten → segment "Maaltijden".

### 3.7 Eigen recepten
- **F23 — Recept maken:** een naam, een lijst ingrediënten (producten met hoeveelheden), het totaalgewicht of aantal porties, en de voedingswaarden die de app automatisch berekent.
- **F24 — Recept loggen:** een recept loggen als portie (bijvoorbeeld "1 van de 4 porties") of in gram.
- **F25 — Recept bewerken:** wijzigingen gelden niet met terugwerkende kracht voor eerdere invoer (zie D3).

### 3.8 Gegevensbeheer
- **F26 — Export:** alle data (producten, recepten, dagboek, instellingen) exporteren als JSON-bestand als backup.
- **F27 — Import:** een JSON-backup terugzetten, bijvoorbeeld na het wisselen van telefoon.
- **F28 — Herinnering aan backup:** de app geeft een melding als de laatste backup langer dan 30 dagen geleden is (omdat de data alleen lokaal staat).

## 4. Niet-functionele requirements
- **N1 — Snelheid:** het hoofdscherm laadt binnen 1 s, en scannen tot product gevonden duurt bij een lokaal product minder dan 2 s.
- **N2 — Bediening:** de app is met één hand te bedienen; de belangrijkste knop ("+ Toevoegen" / "Scan") zit onderin.
- **N3 — Donker thema:** zie V8.
- **N4 — Privacy:** geen analytics of tracking. Alleen naar Open Food Facts gaan barcodes en zoektermen.
- **N5 — Opslag behouden:** de app vraagt `navigator.storage.persist()` aan, zodat de browser de data niet zomaar wist.
- **N6 — Toegankelijkheid:** voldoende contrast en tikdoelen van minimaal 44 px.

## 4a. Vormgeving
**Uitgangspunt: strak, overzichtelijk, zo min mogelijk tekst.** Cijfers en iconen gaan voor zinnen.

- **V1 — Stijl:** iOS-native, in de geest van Apple's Gezondheid- en Instellingen-apps.
  - Systeemlettertype (`-apple-system` / SF Pro).
  - Witte afgeronde kaarten op een lichtgrijze achtergrond (`#F2F2F7`); in donker thema zwart met donkergrijze kaarten.
  - Geen schaduwen, geen verlopen en geen decoratieve afbeeldingen.
- **V2 — Kleur:** één accentkleur, blauw (iOS systeemblauw `#007AFF` / donker `#0A84FF`), voor knoppen, de ring en actieve tabs. Verder alleen grijstinten.
  - Macro's, vezels en water krijgen elk een vaste blauwtint (van donker- tot lichtblauw/cyaan), die overal in de app hetzelfde is. Er komen geen andere kleuren bij.
  - Rood alleen bij "over het doel heen".
- **V3 — Navigatie:** een vaste tabbalk onderin met iconen en korte labels: Vandaag · Week · **Scan** · Producten · Instellingen.
  - Scan is een opvallende ronde knop in het midden, in de accentkleur, en opent direct de camera.
  - De tabbalk houdt rekening met de veilige zones van de iPhone (`env(safe-area-inset-bottom)`).
- **V4 — Voortgang op Vandaag:**
  - Bovenaan een grote ring voor kcal, met in het midden het aantal **kcal over** (groot) en "van 2.000" (klein).
  - Daaronder drie kleine balkjes voor eiwit, koolhydraten en vet, plus een kleine regel voor vezels en water.
  - Zonder doel toont de ring alleen het totaal.
- **V5 — Maaltijdkaarten:** per maaltijd één kaart met de naam en het totaal kcal in de kop. Per invoer één regel: productnaam links, kcal rechts, hoeveelheid klein en grijs eronder.
  - Swipe naar links om te verwijderen. Tik om te bewerken.
  - Een lege maaltijd toont alleen een subtiele "+".
- **V6 — Weinig tekst:**
  - Geen uitlegteksten of introductieschermen. Labels zijn één of twee woorden.
  - Lege staten tonen één korte regel met een actieknop (bijvoorbeeld "Nog niets gegeten · Scan").
  - Getallen in Nederlandse notatie (1.240 kcal, 1,5 L) en afgerond: kcal op hele getallen, macro's op hele grammen.
- **V7 — Interactie:**
  - Tikdoelen van minimaal 44 px.
  - Portiescherm als "sheet" die van onderen omhoog schuift, met grote invoer en knoppen voor snelle porties.
  - Korte bevestiging na toevoegen (een subtiele toast).
- **V8 — Thema:** volgt de licht/donker-instelling van de iPhone.
- **V9 — App-icoon en startscherm:** een eenvoudig, eigen icoon in de accentkleur, plus `apple-touch-icon`. De statusbalk is passend gestyled en de app opent fullscreen (`display: standalone`).

## 5. Datamodel (indicatief)
Product en logregel zijn bewust twee losse objecten. Een product is de vaste "stamkaart" met voedingswaarden per 100 g/ml en wordt één keer opgeslagen. Een logregel is "wat ik op dag X at": een verwijzing naar het product plus de gegeten hoeveelheid.

- **Product:** id, barcode?, naam, merk?, eenheid (g/ml), kcal/eiwit/kh/vet/vezels per 100 (vezels mag leeg zijn als het onbekend is), porties[] (naam, gram), bron (OFF/handmatig), favoriet, laatstGebruikt, laatstePortie
- **Recept:** id, naam, ingrediënten[] (productId, gram), totaalGewicht, aantalPorties, berekende waarden per 100 g
- **Opgeslagen maaltijd:** id, naam, onderdelen[] (productId, gram)
- **Logregel:** id, datum, maaltijd, type (product/recept/snel), refId? (leeg bij snel), omschrijving?, gram, **snapshot van kcal en macro's**
- **Waterregel:** id, datum, tijd, ml
- **Instellingen:** doelen, laatsteBackup

## 6. Ontwerpbeslissingen
- **D1 — Lokale database met Dexie.js:** IndexedDB via Dexie.js voor eenvoud.
- **D2 — Techstack:** Vite + TypeScript, met een lichtgewicht framework (bijvoorbeeld Svelte of React; Claude Code mag kiezen en moet de keuze motiveren).
- **D3 — Snapshot per logregel:** een logregel slaat de berekende voedingswaarden op, zodat de geschiedenis niet verandert als een product of recept later wordt aangepast.
- **D4 — Service worker:** via `vite-plugin-pwa` voor offline gebruik en installatie.

## 7. Schermen
De tabbalk (V3) geeft toegang tot vijf hoofdschermen:

1. **Vandaag:** ring met voortgang, maaltijdkaarten en waterknoppen. Met ‹ › blader je naar andere dagen.
2. **Week:** staafdiagram en gemiddelden (F17a–F17d).
3. **Scan:** opent direct de camera. Daar zijn ook knoppen voor "Zoeken" en "Handmatig".
4. **Producten:** segmenten Recent · Favorieten · Maaltijden · Recepten · Alle, met een zoekveld bovenaan en een knop "Zoek online".
5. **Instellingen:** doelen, export/import, over de app.

Sheets en subschermen:
- **Portie kiezen** (sheet), met live berekening
- **Product bewerken of nieuw invoeren**
- **Recept bewerken**
- **Maaltijd kiezen**: in het portiescherm, standaard op basis van het tijdstip

## 7a. Bouwvolgorde (voorstel)
1. **Basis:** projectopzet, PWA, deploy naar GitHub Pages, tabbalk en vormgeving
2. **Producten:** scannen, Open Food Facts, handmatig invoeren, snel kcal toevoegen, portie kiezen, loggen, dagoverzicht, ongedaan maken
3. **Doelen:** doelen, ring, water
4. **Snelheid:** favorieten, recent, opgeslagen maaltijden, online zoeken
5. **Recepten**
6. **Week en backup:** weekoverzicht, export/import

Na elke fase test ik de app op mijn iPhone.

## 8. Buiten scope (v1)
Accounts en synchronisatie, herinneringen/meldingen, Nutri-Score, doel per weekdag, voedingslabel fotograferen (OCR), vasten-timer, streaks, foto-herkenning van maaltijden, gewicht bijhouden, grafieken over langere periodes dan een week, suiker en zout bijhouden, koppeling met Apple Health of Google Fit, een native app.

## 9. Open punten
- [x] Platform: alleen iPhone (beslist)
- [x] Hosting: GitHub Pages (beslist)
- [x] Na het scannen: eerst het portiescherm, niet direct loggen (beslist, F1a)
- [x] Startwaarden van de doelen: stel ik later zelf in de app in (beslist)
- [x] Online zoeken in Open Food Facts: ja (beslist, F5a)
- [x] Weekoverzicht: ja, in v1 (beslist, F17a–F17d)
- [x] Vezels bijhouden: ja (beslist)
