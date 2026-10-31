# VacuumTube para Windows 7 / 8 / 8.1

Port de [shy1132/VacuumTube](https://github.com/shy1132/VacuumTube) (MIT) a Electron 22.3.27 (Chromium 108), el último Electron que corre en Windows 7. También funciona en Windows 10/11.

- Instaladores y zips de 64 y 32 bits en **Releases** (o en los artefactos de **Actions**). Para publicar uno nuevo: Releases → Draft a new release → Publish; la acción compila y sube los archivos.
- Sin auto‑actualización (se actualiza descargando el nuevo release).
- Requiere Windows 7 SP1 + KB2999226.

Si YouTube no carga, crea `%APPDATA%\VacuumTube\ua-override.json`, por ejemplo (valores de ejemplo):
```json
{ "cobaltVersion": "25.lts.30.1034423-gold", "v8Version": "10.8.168.25" }
```
