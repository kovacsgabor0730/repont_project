import mysql.connector
from mysql.connector import errorcode
import os
from time import sleep

DB_CONFIG = {
    'user': 'root',
    'password': '',
    'host': '127.0.0.1',
    'database': 'repont',
    'raise_on_warnings': True
}

PRODUCT_LOG_FILE = 'products.log'
RECYCLING_LOG_FILE = 'recycling.log'
PROCESSED_SUFFIX = '.processed'

def connect_to_db():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"Adatbázis csatlakozási hiba: {err}")
        return None

def process_products_log(conn, log_file):
    cursor = conn.cursor()
    sql = "INSERT INTO products (type_number, product_name) VALUES (%s, %s) ON DUPLICATE KEY UPDATE product_name=VALUES(product_name)"
    
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Logfájl nem található: {log_file}")
        return

    insert_count = 0
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        parts = [p.strip() for p in line.split('|')]
        
        if len(parts) >= 3:
            try:
                data = (parts[1], parts[2]) 
                cursor.execute(sql, data)
                insert_count += 1
            except Exception as e:
                print(f"Hiba a 'products' sor beillesztésekor ('{line}'): {e}")
                
    conn.commit()
    print(f"Sikeresen beillesztve/frissítve {insert_count} termék a 'products' táblában.")
    cursor.close()
    
def process_recycling_log(conn, log_file):
    cursor = conn.cursor()
    sql = "INSERT INTO recycling (event_date, machine, product, event_type) VALUES (%s, %s, %s, %s)"

    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"Logfájl nem található: {log_file}")
        return

    insert_count = 0
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        parts = [p.strip() for p in line.split('|')]
        
        if len(parts) == 4:
            try:
                data = (parts[0], int(parts[1]), int(parts[2]), parts[3]) 
                cursor.execute(sql, data)
                insert_count += 1
            except mysql.connector.Error as err:
                 print(f"Adatbázis hiba a 'recycling' sor beillesztésekor ('{line}'): {err.msg}")
            except Exception as e:
                print(f"Általános hiba a 'recycling' sor beillesztésekor ('{line}'): {e}")
                
    conn.commit()
    print(f"Sikeresen beillesztve {insert_count} esemény a 'recycling' táblába.")
    cursor.close()

def main_service_loop(): 
    print("Service elindítva")
    
    conn = connect_to_db()
    if not conn:
        print("Nem sikerült az adatbázishoz csatlakozni. A service leáll.")
        return

    while True:
        try:
            if os.path.exists(PRODUCT_LOG_FILE):
                print(f"\n {PRODUCT_LOG_FILE} feldolgozása...")
                process_products_log(conn, PRODUCT_LOG_FILE)
                os.rename(PRODUCT_LOG_FILE, PRODUCT_LOG_FILE + PROCESSED_SUFFIX)
                print(f"   Átnevezve: {PRODUCT_LOG_FILE}{PROCESSED_SUFFIX}")
            
            if os.path.exists(RECYCLING_LOG_FILE):
                print(f"\n {RECYCLING_LOG_FILE} feldolgozása...")
                process_recycling_log(conn, RECYCLING_LOG_FILE)
                os.rename(RECYCLING_LOG_FILE, RECYCLING_LOG_FILE + PROCESSED_SUFFIX)
                print(f"   Átnevezve: {RECYCLING_LOG_FILE}{PROCESSED_SUFFIX}")
            
            else:
                print("Nincs új log fájl. Várakozás...")

        except Exception as e:
            print(f"Kritikus hiba a fő ciklusban: {e}")
            if conn and not conn.is_connected():
                print("Kapcsolat megszakadt, újrapróbálkozás...")
                conn = connect_to_db()
            
        sleep(10)
        if not conn:
            sleep(30)
            conn = connect_to_db()
            if not conn: break

if __name__ == "__main__":
    main_service_loop()