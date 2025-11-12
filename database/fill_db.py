import mysql.connector
from datetime import datetime, timedelta
import random
import time

# --- Adatbázis Kapcsolódási Beállítások ---
DB_CONFIG = {
    'host': '127.0.0.1',
    'user': 'root',
    'password': '',
    'database': 'repont'  # Fontos, hogy ez megegyezzen a XAMPP-ban használt adatbázis nevével
}

# --- Adatbeállítások ---
NUM_RECORDS = 120000 

PRODUCT_DATA = [
    ("1001", "Coca-Cola Classic 0.5L"),
    ("1002", "Fanta Narancs 1.5L"),
    ("1003", "Sprite Zero 0.33L"),
    ("1004", "Pepsi Max 2L"),
    ("1005", "Kinley Tonic Water 1L"),
    ("1006", "Schweppes Citrus Mix 0.5L"),
    ("1007", "Dr Pepper Original 0.33L"),
    ("1008", "Red Bull Energiaital 0.25L"),
    ("1009", "Szentkirályi Ásványvíz 1.5L"),
    ("1010", "Hell Classic Energiaital 0.5L"),
]

# Gépek listája (10 db, új oszlopoknak megfelelő adatokkal)
DUMMY_MACHINES_INFO = [
    # (name, postal_code, public_space_name, public_space_type, house_number)
    ("REPOINT-BUD-001", 1051, "Szabadság tér", "tér", 2),
    ("REPOINT-DEB-002", 4026, "Piac utca", "utca", 55),
    ("REPOINT-SZEG-003", 6720, "Széchenyi tér", "tér", 10),
    ("REPOINT-GYOR-004", 9021, "Baross Gábor utca", "utca", 32),
    ("REPOINT-PEC-005", 7621, "Színház tér", "tér", 4),
    ("REPOINT-NYI-006", 4400, "Kossuth Lajos utca", "utca", 15),
    ("REPOINT-MIS-007", 3530, "Városház tér", "tér", 8),
    ("REPOINT-SOMB-008", 9700, "Fő tér", "tér", 22),
    ("REPOINT-ZALA-009", 8900, "Kossuth utca", "utca", 1),
    ("REPOINT-EGER-010", 3300, "Dobó István tér", "tér", 12),
]


def connect_db():
    """Létrehoz egy kapcsolatot az adatbázissal."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Hiba az adatbázishoz való kapcsolódáskor: {err}")
        exit()

# --- 1. Machines Tábla Feltöltése ---
def insert_machines(conn):
    """Feltölti a machines táblát 10 dummy gépazonosítóval és címmel."""
    print("--- 1. Machines tábla feltöltése (10 rekord)... ---")
    cursor = conn.cursor()
    
    # Telepítési dátum generálása (2024. év)
    install_date_base = datetime(2024, 1, 1)
    
    # Adatok előkészítése a beszúráshoz
    machine_data_for_insert = []
    for name, postal_code, public_space_name, public_space_type, house_number in DUMMY_MACHINES_INFO:
        # Véletlenszerű telepítési dátum a 2024-es évből
        random_days = random.randint(1, 365)
        installation_date = install_date_base + timedelta(days=random_days)
        
        machine_data_for_insert.append((
            name,
            installation_date.strftime('%Y-%m-%d %H:%M:%S'), # Formázás a DATETIME típushoz
            postal_code,
            public_space_name,
            public_space_type,
            house_number
        ))
    
    # A lekérdezés az új oszlopokhoz igazítva
    insert_query = (
        "INSERT INTO machines (name, installation_date, postal_code, public_space_name, public_space_type, house_number) "
        "VALUES (%s, %s, %s, %s, %s, %s)"
    )
    
    try:
        cursor.executemany(insert_query, machine_data_for_insert)
        conn.commit()
        print(f"Sikeresen beszúrva {len(machine_data_for_insert)} gép a machines táblába.")
    except mysql.connector.Error as err:
        print(f"Hiba a machines tábla feltöltésekor: {err}")
        conn.close()
        exit()
    finally:
        cursor.close()

# --- 2. Products Tábla Feltöltése ---
def insert_products(conn):
    """Feltölti a products táblát dummy üdítőkkel."""
    print("--- 2. Products tábla feltöltése (10 rekord)... ---")
    cursor = conn.cursor()
    
    insert_query = "INSERT INTO products (type_number, product_name) VALUES (%s, %s)"
    try:
        cursor.executemany(insert_query, PRODUCT_DATA)
        conn.commit()
        print(f"Sikeresen beszúrva {len(PRODUCT_DATA)} termék a products táblába.")
    except mysql.connector.Error as err:
        print(f"Hiba a products tábla feltöltésekor: {err}")
        conn.close()
        exit()
    finally:
        cursor.close()

# --- 3. Recycling Tábla Feltöltése (120.000+ rekord) ---
def populate_recycling(conn):
    """Generál és feltölt 120.000+ rekordot a recycling táblába."""
    print(f"\n--- 3. Recycling tábla feltöltése ({NUM_RECORDS} rekord)... ---")
    
    # 1. Képezzük le a beszúrt gép és termék ID-ket
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM machines")
        machine_ids = [row[0] for row in cursor.fetchall()]
        
        cursor.execute("SELECT id FROM products")
        product_ids = [row[0] for row in cursor.fetchall()]
        
    except mysql.connector.Error as err:
        print(f"Hiba az ID-k lekérésekor: {err}")
        conn.close()
        exit()
    finally:
        cursor.close()

    if not machine_ids or not product_ids:
        print("HIBA: Hiányzó ID-k a machines vagy products táblában! Állítsd le a scriptet.")
        return

    # 2. Adatgenerálás (Batch)
    recycling_records = []
    # Az event_type a sémában 'success', 'error', 'warning'
    event_types = ['success', 'error', 'warning'] 
    
    # Kezdő dátum (a CHECK kényszer miatt 2025-01-01 és 2025-04-02 között kell lennie)
    # Beállítjuk az intervallumot, hogy ne sérüljön a CHK_event_date kényszer!
    start_date_bound = datetime(2025, 1, 1)
    end_date_bound = datetime(2025, 4, 1, 23, 59, 59) # Utolsó elfogadható időpont (2025-04-02 előtt)
    time_difference = end_date_bound - start_date_bound
    total_seconds = int(time_difference.total_seconds())

    for _ in range(NUM_RECORDS):
        # Véletlenszerű időpont a megengedett intervallumon belül
        random_seconds = random.randint(0, total_seconds)
        event_date = start_date_bound + timedelta(seconds=random_seconds)
        
        machine_id = random.choice(machine_ids)
        product_id = random.choice(product_ids)
        event_type = random.choice(event_types)
        
        recycling_records.append((machine_id, product_id, event_type, event_date.strftime('%Y-%m-%d %H:%M:%S')))

    # 3. Adatbázis beszúrás (Batch)
    insert_query = (
        "INSERT INTO recycling (machine, product, event_type, event_date) "
        "VALUES (%s, %s, %s, %s)"
    )
    
    cursor = conn.cursor()
    batch_size = 5000 
    
    start_time = time.time()
    
    try:
        # Kikapcsoljuk az idegen kulcs ellenőrzést, hogy gyorsabb legyen a beszúrás
        cursor.execute("SET FOREIGN_KEY_CHECKS=0")
        
        for i in range(0, NUM_RECORDS, batch_size):
            batch = recycling_records[i:i + batch_size]
            cursor.executemany(insert_query, batch)
            conn.commit()
            print(f"Beszúrás: {i + len(batch)} / {NUM_RECORDS} rekord.")
            
        # Visszakapcsoljuk az idegen kulcs ellenőrzést
        cursor.execute("SET FOREIGN_KEY_CHECKS=1")
            
        end_time = time.time()
        print(f"\nSikeresen beszúrva {NUM_RECORDS} rekord.")
        print(f"Teljes idő: {end_time - start_time:.2f} másodperc.")
    except mysql.connector.Error as err:
        print(f"Hiba a recycling tábla feltöltésekor: {err}")
        conn.close()
        exit()
    finally:
        cursor.close()


def main():
    conn = connect_db()
    
    # A megfelelő sorrend: machines -> products -> recycling
    insert_machines(conn)
    insert_products(conn)
    populate_recycling(conn)

    conn.close()
    print("\nAdatbázis feltöltés befejeződött.")

if __name__ == "__main__":
    main()