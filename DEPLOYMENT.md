# Deployment-Anleitung: AktienWatcher

Schritt-für-Schritt-Anleitung, um den AktienWatcher auf GitHub zu pushen und auf Vercel als Live-Demo zu deployen.

---

## Wichtiger Hinweis vorab: OneDrive + node_modules

`node_modules` enthält ca. 10'000-30'000 Dateien. OneDrive synchronisiert jede davon einzeln, was den PC ausbremst und unnötig Cloud-Storage frisst.

**Empfehlung:** Vor dem ersten `npm install` das Projekt aus OneDrive in einen lokalen Dev-Ordner ausserhalb der Sync kopieren.

```powershell
# Beispiel: Projekt nach C:\Dev kopieren
robocopy "C:\Users\Tafol\OneDrive - Kantonsschule Baden\Praktikum\Projekte\AktienWatcher" "C:\Dev\AktienWatcher" /E /XD node_modules
```

Ab diesem Punkt arbeitest du in `C:\Dev\AktienWatcher`. Den Code synchronisierst du über GitHub zurück, nicht über OneDrive.

---

## Schritt 1: Lokal testen

```powershell
cd C:\Dev\AktienWatcher
npm install
npm run dev
```

Browser öffnet sich auf http://localhost:5173. Watchlist sollte mit Standard-Aktien (AAPL, MSFT, GOOGL, TSLA, NVDA) geladen werden. Falls du `401` oder `403` in der Browser-Konsole siehst: Finnhub-Key in `.env` prüfen.

Wenn alles läuft, einmal den Build testen:

```powershell
npm run build
npm run preview
```

---

## Schritt 2: GitHub-Repo anlegen

### Option A: Über die Webseite

1. Auf https://github.com/new gehen
2. **Repository name:** `aktien-watcher` (Kleinbuchstaben, mit Bindestrich ist üblich)
3. **Description:** `Aktien-Watchlist mit Live-Kursen und Charts - React + TypeScript + Finnhub`
4. **Public** wählen (Portfolio-Sichtbarkeit!)
5. **NICHT** "Add README" / "Add .gitignore" anhaken — wir haben beides schon
6. **Create repository** klicken

### Option B: Über GitHub CLI (`gh`)

```powershell
cd C:\Dev\AktienWatcher
gh repo create aktien-watcher --public --description "Aktien-Watchlist mit Live-Kursen und Charts - React + TypeScript + Finnhub"
```

---

## Schritt 3: Code pushen

```powershell
cd C:\Dev\AktienWatcher

# Wichtig: prüfen dass .env NICHT mit committed wird
git init
git add .
git status   # <-- .env sollte NICHT auftauchen!

git commit -m "Initial commit: AktienWatcher mit React + TypeScript + Finnhub"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/aktien-watcher.git
git push -u origin main
```

**Wenn `.env` doch in `git status` auftaucht:** abbrechen, Datei aus dem Staging nehmen (`git reset HEAD .env`), prüfen dass `.gitignore` korrekt ist (`.env` muss drin stehen).

---

## Schritt 4: Vercel-Deployment

1. Auf https://vercel.com mit deinem **GitHub-Account** einloggen (kostenlos)
2. **Add New → Project**
3. Das `aktien-watcher` Repo auswählen → **Import**
4. Vercel erkennt Vite automatisch. Die Defaults stimmen:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables** aufklappen und hinzufügen:
   - Key: `VITE_FINNHUB_API_KEY`
   - Value: dein Finnhub-Key
   - Environments: alle drei (Production, Preview, Development)
6. **Deploy** klicken
7. ~1-2 Minuten warten

Vercel gibt dir eine URL wie `aktien-watcher-abc123.vercel.app`. Die kannst du im README und auf der Portfolio-Website verlinken.

### Optional: Eigene Subdomain

Im Vercel-Dashboard unter **Settings → Domains** kannst du eine eigene Domain aufschalten. Wenn du irgendwann eine eigene Portfolio-Domain hast (z.B. `tim-dev.ch`), wäre `aktien.tim-dev.ch` ideal.

---

## Schritt 5: README aktualisieren

Sobald du die Vercel-URL hast, im README den Platzhalter ersetzen:

```diff
- - Live: `https://aktienwatcher.vercel.app` (Platzhalter)
+ - Live: https://aktien-watcher-abc123.vercel.app
```

Und mindestens zwei Screenshots in `docs/` ablegen und im README einbinden. Empfehlung: ein Screenshot der Watchlist, einer der Detailseite mit Chart.

---

## Schritt 6: Updates pushen

Ab jetzt: jeder `git push` auf `main` triggert automatisch ein neues Vercel-Deployment.

```powershell
git add .
git commit -m "feat: Vergleichs-Aktien mit normalisiertem %-Chart"
git push
```

Vercel pingt dich per Mail, wenn der neue Build live ist.

---

## Checkliste vor dem ersten Push

- [ ] `.env` ist in `.gitignore` (bereits erledigt)
- [ ] `.env` taucht **nicht** in `git status` auf
- [ ] `npm run build` läuft ohne Fehler durch
- [ ] README-Live-Link-Platzhalter ist als solcher erkennbar
- [ ] Repo-Name ist lesbar und beschreibend (z.B. `aktien-watcher`, nicht `test123`)
- [ ] Beschreibung im GitHub-Repo ist gesetzt

---

## Wenn etwas schiefgeht

| Symptom                                | Ursache / Lösung                                                              |
|----------------------------------------|-------------------------------------------------------------------------------|
| Vercel-Build failt mit `Module not found` | `npm install` lokal noch mal laufen lassen, `package-lock.json` mit committen |
| Browser zeigt weisse Seite             | Console öffnen (F12); meistens fehlt die `VITE_FINNHUB_API_KEY` env var       |
| `git push` will Passwort               | Personal Access Token verwenden (GitHub Settings → Developer Settings)        |
| `.env` ist aus Versehen committed      | `git rm --cached .env`, neu committen, **Finnhub-Key regenerieren** auf finnhub.io |
