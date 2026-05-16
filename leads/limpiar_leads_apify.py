"""
Giro Lab — Limpiador de CSVs de Apify LinkedIn
================================================
Uso: python limpiar_leads_apify.py <archivo.csv> <especialidad>

Ejemplo:
  python limpiar_leads_apify.py dataset_coaches.csv "Coach"
  python limpiar_leads_apify.py dataset_psicologos.csv "Psicólogo"

Genera: leads_<especialidad>_CLEAN.csv con 14 columnas listas para Instantly
"""

import csv
import sys
import os
from datetime import datetime

def limpiar_csv(input_path, especialidad):
    # Leer CSV sucio de Apify
    with open(input_path, encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if not rows:
        print("❌ El archivo está vacío.")
        return

    clean_rows = []
    for r in rows:
        email       = r.get('emails/0/email', '').strip()
        email_status = r.get('emails/0/status', '').strip()
        email_score  = r.get('emails/0/qualityScore', '').strip()

        clean_rows.append({
            'firstName':      r.get('firstName', '').strip(),
            'lastName':       r.get('lastName', '').strip(),
            'email':          email,
            'emailStatus':    email_status,   # valid / risky / invalid
            'emailScore':     email_score,    # 0-100
            'linkedinUrl':    r.get('linkedinUrl', '').strip(),
            'headline':       r.get('headline', '').strip(),
            'position':       r.get('currentPosition/0/position', '').strip(),
            'company':        r.get('currentPosition/0/companyName', '').strip(),
            'duration':       r.get('currentPosition/0/duration', '').strip(),
            'location':       r.get('location/parsed/text', '').strip(),
            'connections':    r.get('connectionsCount', '').strip(),
            'topSkills':      r.get('topSkills', '').strip(),
            'especialidad':   especialidad,
            'canal':          'email' if email else 'linkedin',
            'about':          r.get('about', '').strip()[:300],  # primeros 300 chars
        })

    # Stats
    total       = len(clean_rows)
    con_email   = sum(1 for r in clean_rows if r['email'])
    validos     = sum(1 for r in clean_rows if r['emailStatus'] == 'valid')
    risky       = sum(1 for r in clean_rows if r['emailStatus'] == 'risky')
    sin_email   = sum(1 for r in clean_rows if not r['email'])

    # Nombre del output
    fecha = datetime.now().strftime('%Y%m%d')
    esp_slug = especialidad.lower().replace(' ', '_').replace('ó','o').replace('é','e').replace('í','i')
    output_name = f"leads_{esp_slug}_{fecha}_CLEAN.csv"
    # Guardar en la carpeta donde se ejecuta el script (carpeta actual)
    output_dir = os.getcwd()
    output_path = os.path.join(output_dir, output_name)

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=clean_rows[0].keys())
        writer.writeheader()
        writer.writerows(clean_rows)

    print(f"\n✅ CSV limpio generado: {output_name}")
    print(f"   Columnas: {len(clean_rows[0])} (de ~141 originales)")
    print(f"   Total leads:   {total}")
    print(f"   Con email:     {con_email} ({round(con_email/total*100)}%)")
    print(f"   → válidos:    {validos}")
    print(f"   → risky:      {risky}")
    print(f"   Sin email:     {sin_email} → outreach por LinkedIn")
    print(f"\n📁 Guardado en: {output_path}")

# ─── Entry point ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Uso: python limpiar_leads_apify.py <archivo.csv> <especialidad>")
        print('Ejemplo: python limpiar_leads_apify.py dataset_coaches.csv "Coach"')
        sys.exit(1)

    input_path   = sys.argv[1]
    especialidad = sys.argv[2]

    if not os.path.exists(input_path):
        print(f"❌ No se encontró el archivo: {input_path}")
        sys.exit(1)

    limpiar_csv(input_path, especialidad)
