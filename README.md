# 🚀 Discord Bot mit Portainer deployen

Dieses Tutorial erklärt dir **Schritt für Schritt**, wie du den Bot mit **Portainer** deployen, verwalten und jederzeit neu starten kannst.

---

## 🔑 Voraussetzungen
- Portainer ist installiert und erreichbar.  
- Du hast ein **GitHub-Repository** mit dem Bot (z. B. `https://github.com/xfin3st/discord-bot`).  
- Du hast ein `.env`-File oder setzt die Variablen direkt in Portainer.  
  - `DISCORD_TOKEN` → Bot-Token (vom Discord Developer Portal)  
  - `CLIENT_ID` → Application ID  
  - `GUILD_ID` → (optional, für sofortige Command-Registrierung in deinem Server)  

---

## 📦 Deployment als Stack in Portainer

### 1. Stack anlegen
1. Öffne Portainer → **Stacks** → **+ Add stack**.  
2. Stack-Name eingeben, z. B. `discord-bot`.  
3. Reiter **Git repository** auswählen.  
4. Repository-URL eingeben:  
   ```
   https://github.com/xfin3st/discord-bot.git
   ```
5. Falls dein Repo **privat** ist:
   - `Authentication` aktivieren  
   - Username = dein GitHub-Name (`xfin3st`)  
   - Personal Access Token eintragen (PAT → in GitHub unter *Settings → Developer settings → Tokens (classic)* generieren, mit `repo`-Rechten).  
6. **Repository reference**:  
   ```
   refs/heads/main
   ```
7. **Compose path**:  
   ```
   docker-compose.yml
   ```

---

### 2. Compose-Datei prüfen
Dein `docker-compose.yml` sollte so aussehen (kein Volume!):

```yaml
version: "3.8"

services:
  discord-bot:
    build: .
    container_name: fin3st-discord-bot
    restart: unless-stopped
    environment:
      DISCORD_TOKEN: ${DISCORD_TOKEN}
      CLIENT_ID: ${CLIENT_ID}
      GUILD_ID: ${GUILD_ID}
      NODE_ENV: production
```

---

### 3. Environment Variablen setzen
1. Unten im Stack-Formular **Environment variables** öffnen.  
2. Folgende Variablen eintragen:
   - `DISCORD_TOKEN=xxxxxxxxxxxxxxxxxx`  
   - `CLIENT_ID=xxxxxxxxxxxxxxxx`  
   - `GUILD_ID=xxxxxxxxxxxxxxx` (optional)  

---

### 4. Deploy
- Klicke auf **Deploy the stack**.  
- Portainer clont das Repo, baut den Container und startet den Bot.  

---

## 🔍 Logs checken
1. In Portainer → **Containers** → `fin3st-discord-bot`.  
2. Auf den Container klicken → **Logs**.  
3. Du solltest sehen:
   ```
   Guild-Commands für GUILD_ID=... registriert.
   Slash-Commands registriert.
   ✅ Eingeloggt als fin3stCore#3026
   ```

---

## 🔄 Stack neu deployen (bei Code-Updates)
1. In Portainer → **Stacks** → `discord-bot`.  
2. **Recreate** klicken.  
3. Häkchen bei **Pull and build** setzen (damit neuer Code aus GitHub geladen wird).  
4. Bestätigen → Bot wird mit neuem Code neu gebaut.  

---

## 🛠️ Tipps
- **Commands fehlen?**  
  → `GUILD_ID` setzen, damit die Commands sofort auf deinem Server erscheinen. Ohne dauert die globale Registrierung bei Discord.  
- **Join/Leave funktioniert nicht?**  
  → Im [Discord Developer Portal](https://discord.com/developers/applications) bei deinem Bot unter *Privileged Gateway Intents* → `Server Members Intent` aktivieren.  
- **Bot schreibt nicht?**  
  → Prüfe, ob er in mindestens einem Textkanal **Send Messages**-Rechte hat oder ob ein System-Channel gesetzt ist.  

---

## ✅ Nützlich
- Bot neu starten → Container → **Recreate** oder **Restart**.  
- Token ändern → Stack → **Edit** → Environment-Variable anpassen → **Update**.  
- Logs ansehen → Container → **Logs**.  

---

👉 Damit kannst du deinen Bot jederzeit easy verwalten, ohne manuell auf den Server zu müssen.  
