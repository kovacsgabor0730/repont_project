# Projekt Beüzemelési Útmutató: Repont project

Ez a dokumentum bemutatja, hogyan kell beállítani és futtatni a teljes alkalmazást helyi fejlesztői környezetben (Windows / XAMPP), amely magában foglalja a Laravel API-t és a React Frontendet egyetlen egységes domain alatt.

## 1. Előfeltételek

A projekt sikeres futtatásához a következő szoftverek szükségesek:

* **PHP** (8.1+) és **Composer**
* **Node.js** (LTS verzió) és **npm** vagy **Yarn**
* **MySQL Adatbázis** (XAMPP vagy WAMP segítségével futtatva)
* **Apache Webkiszolgáló** (XAMPP-ból vagy önállóan)
    * **Kritikus Modulok:** `mod_proxy`, `mod_proxy_http`, `mod_rewrite`

---

## 2. Projekt Klónozása és Telepítése

Klónozd a tárolót a helyi gépedre, majd telepítsd a függőségeket a backendhez és a frontendhez is.

### 1. Backend Telepítése (Laravel)

1.  Lépj be a Laravel gyökérkönyvtárba (`backend/`):
    ```bash
    cd backend/
    ```
2.  Telepítsd a PHP függőségeket:
    ```bash
    composer install
    ```
3.  Hozd létre a környezeti fájlt, és állítsd be az adatbázis hozzáférést a 3. pont szerint:
    ```bash
    cp .env.example .env
    ```
4.  Generálj alkalmazás kulcsot:
    ```bash
    php artisan key:generate
    ```

### 2. Frontend Telepítése (React)

1.  Lépj be a React gyökérkönyvtárba (`frontend/`):
    ```bash
    cd frontend/
    ```
2.  Telepítsd a Node.js függőségeket:
    ```bash
    npm install
    # vagy yarn install
    ```

---

## 3. Adatbázis és Logimporter Beállítása

1.  Győződj meg róla, hogy a MySQL fut.
2.  Állítsd be az adatbázis hozzáférést a Laravel `.env` fájlban (`DB_DATABASE=repont`).
3.  Futtasd a migrációkat a táblák létrehozásához:
    ```bash
    # A Laravel gyökérkönyvtárban:
    php artisan migrate --seed
    ```
4.  **Log Importer Szerviz:**
    * Szerkeszd a `log_importer_service.py` fájlban a `DB_CONFIG` részt a saját MySQL jelszavaddal.
    * A logfájlokat (`products.log`, `recycling.log`) a Python szkripttel azonos mappába helyezd.

---

## 4. Fejlesztői Szerverek Indítása

Az alkalmazás két külön folyamatban fut, ami kritikus az Apache beállításhoz.

1.  **Backend indítása (Laravel API):**
    ```bash
    # A Laravel gyökérkönyvtárban:
    php artisan serve --port=8000
    ```
    * **Elérhető:** `http://localhost:8000`

2.  **Frontend indítása (React):**
    ```bash
    # A React gyökérkönyvtárban:
    npm run dev
    ```
    * **Elérhető:** `http://localhost:5173` (vagy a konzolban jelzett porton)

---

## 5. Apache Reverse Proxy Beállítása

Ez a lépés teszi lehetővé, hogy a két külön szerver egyetlen URL-en (pl. `http://localhost/`) legyen elérhető.

### 5.1. Apache Modulok Engedélyezése

Keresd meg az Apache **`httpd.conf`** fájlt (pl. `C:\xampp\apache\conf\httpd.conf`), és győződj meg róla, hogy a következő sorok engedélyezve vannak:

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule rewrite_module modules/mod_rewrite.so
```

### 5.2. Virtual Host Konfiguráció

Keresd meg a **`httpd-vhosts.conf`** fájlt (pl. `C:\xampp\apache\conf\extra\httpd-vhosts.conf`), és a VirtualHost *:80 blokkba illeszd be a következő Reverse Proxy szabályokat.

```apache
<VirtualHost *:80>
    ServerName localhost
    # Bármely gyökérkönyvtár jó, mivel minden átmegy a proxyn
    DocumentRoot "C:/xampp/htdocs" 

    RewriteEngine On

    # --- 1. API PROXY: Továbbítás a Laravel 8000-es portjára
    # Minden, ami /api/ kezdetű, a Laravel API-nak szól.
    ProxyPass /api/ http://localhost:8000/api/
    ProxyPassReverse /api/ http://localhost:8000/api/
    
    # --- 2. FRONTEND PROXY: Minden más kérés a React 3000-es portjára megy.
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

</VirtualHost>
```
### 5.3. Apache Újraindítása
A konfiguráció életbe lépéséhez feltétlenül indítsd újra az Apache szervert a XAMPP Control Panel-en.

## 6. Hozzáférés

Ha a Laravel és a React szerverek, valamint az Apache is fut, látogass el:

```bash
http://localhost/
```

Ezzel eléred a React alkalmazást, és az API hívások automatikusan a Laravel backend felé irányítódnak.