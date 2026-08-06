# RNF-09 — Sincronización del Reloj del Servidor (NTP)

## Objetivo

El backend en NestJS depende del reloj del servidor para:

- Cerrar automáticamente el retardo a los **10 minutos** de iniciada cada clase.
- Validar el **QR dinámico** (caduca a los 30 segundos según `QR_EXPIRATION_TIME`).
- Registrar marcas de tiempo (`scan_timestamp`, `recorded_at`, `scanned_at`) consistentes
  entre la terminal perimetral, el backend y la base de datos.

Por eso el sistema operativo del droplet debe sincronizarse **obligatoriamente** mediante
protocolo NTP (RNF-09).

## Configuración en Debian/Ubuntu (droplet)

### Opción recomendada: systemd-timesyncd

```bash
# 1. Instalar el cliente NTP
sudo apt-get update
sudo apt-get install -y systemd-timesyncd

# 2. Apuntar a los servidores NTP oficiales de México
sudo tee /etc/systemd/timesyncd.conf > /dev/null <<'EOF'
[Time]
NTP=time.google.com 0.mx.pool.ntp.org 1.mx.pool.ntp.org
FallbackNTP=ntp.ubuntu.com
EOF

# 3. Habilitar y arrancar la sincronización
sudo timedatectl set-ntp true
sudo systemctl restart systemd-timesyncd

# 4. Verificar
timedatectl
timedatectl show-timesync --property=ServerName,Status
```

### Opción alternativa: chrony

```bash
sudo apt-get update
sudo apt-get install -y chrony
sudo systemctl enable --now chrony
chronyc tracking   # verifica el desfase y el estado
```

## Verificación del estado

```bash
# El reloj está sincronizado
timedatectl

# Verificar que la hora del sistema sea correcta
date

# Si NTP está activo debe mostrarse:
# System clock synchronized: yes
# NTP service: active
```

## Regla operativa

- Nunca apagar `timedatectl set-ntp` ni desactivar el servicio `systemd-timesyncd/chrony`.
- Después de cada `snapshot`/restauración del droplet, revisar `timedatectl`.
- Si se despliega en contenedores, montar `/etc/localtime` correcto y dejar el NTP
  en el **host**, no dentro del contenedor.

## Relación con el código

- El cierre de retardo automático se basa en `classStartTime` (hora de inicio del
  horario) contra `now` del servidor en `attendance.service.ts` → `scanQr`.
- El QR dinámico caduca en `QR_EXPIRATION_TIME = 30s` evaluado contra el reloj del
  servidor.
