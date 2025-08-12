# 🚀 Instrucciones de Despliegue para TU OpenMediaVault

Esta guía está personalizada específicamente para tu configuración de OpenMediaVault.

## 📋 Tu Configuración Actual

- **Disco físico**: RAID 1 (espejo) `/dev/md0` con `/dev/sda` y `/dev/sdb`
- **Capacidad**: 931.39 GiB con redundancia completa
- **UUID del disco**: `9cac2098-d700-46fa-82a3-0835758908e6`
- **Servicios activos**: DuckDNS, filescomp, nginxMio, Servi-N8N, wireward
- **Carpetas compartidas**: DiscoCOMP, appdata, compose, descargas, docker, mispersonal

### 🛡️ Ventajas de tu RAID 1
- **Redundancia completa**: Si falla un disco, tus datos están seguros
- **Rendimiento de lectura mejorado**: Ambos discos pueden servir datos
- **Tolerancia a fallos**: El sistema continúa funcionando con un solo disco

## 🎯 Configuración Optimizada

### Puertos Asignados (sin conflictos)
- **Backend**: Puerto 8080 (evita conflicto con nginxMio)
- **Frontend**: Puerto 3001 (evita conflicto con servicios web)
- **Base de datos**: Puerto 5433 (evita conflicto con PostgreSQL del sistema)

### Rutas de Almacenamiento
```
Base: /srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/portal-sandoval/
├── postgres_data/     # Base de datos
├── postgres_backups/  # Backups automáticos
├── static/           # Archivos estáticos Django
├── media/            # Archivos subidos por usuarios
└── logs/             # Logs de la aplicación
```

## 🚀 Pasos de Despliegue

### 1. Conectarse al OMV por SSH
```bash
ssh tu-usuario@ip-de-tu-omv
```

### 2. Preparar Directorios
```bash
# Crear directorio base
sudo mkdir -p /srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/portal-sandoval

# Crear subdirectorios
sudo mkdir -p /srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/portal-sandoval/{postgres_data,postgres_backups,static,media,logs}

# Establecer permisos
sudo chown -R 1000:1000 /srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/portal-sandoval
sudo chmod -R 755 /srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/portal-sandoval
```

### 3. Clonar el Repositorio
```bash
# Ir al directorio de trabajo (puedes usar la carpeta compose existente)
cd /srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/compose

# Clonar el repositorio
git clone https://github.com/carlonchosando/portal-sandoval.git
cd portal-sandoval
```

### 4. Configurar Variables de Entorno
```bash
# Usar la configuración específica para tu OMV
cp .env.tu-omv .env

# Editar para personalizar contraseñas
nano .env
```

**⚠️ IMPORTANTE**: Cambia estas variables en el archivo `.env`:
- `SECRET_KEY`: Genera una nueva clave secreta
- `POSTGRES_PASSWORD`: Usa una contraseña fuerte
- `DJANGO_SUPERUSER_PASSWORD`: Cambia la contraseña del admin

### 5. Generar Clave Secreta
```bash
# Generar SECRET_KEY (si tienes Python)
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# O usar una herramienta online: https://djecrety.ir/
```

### 6. Desplegar la Aplicación
```bash
# Levantar los servicios
docker-compose -f docker-compose.production.yml up -d

# Verificar que todo está funcionando
docker-compose -f docker-compose.production.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.production.yml logs -f
```

## 🌐 Acceso a la Aplicación

Una vez desplegada, accede desde cualquier dispositivo en tu red:

- **Frontend**: `http://IP-DE-TU-OMV:3001`
- **Admin Django**: `http://IP-DE-TU-OMV:8080/admin/`
- **API REST**: `http://IP-DE-TU-OMV:8080/api/v1/`

### Credenciales Iniciales
- **Usuario**: admin
- **Contraseña**: ChangeMe123! (o la que configuraste)

## 🔧 Comandos Útiles

### Gestión de Servicios
```bash
# Ver estado
docker-compose -f docker-compose.production.yml ps

# Parar servicios
docker-compose -f docker-compose.production.yml down

# Reiniciar servicios
docker-compose -f docker-compose.production.yml restart

# Ver logs específicos
docker-compose -f docker-compose.production.yml logs backend
docker-compose -f docker-compose.production.yml logs frontend
docker-compose -f docker-compose.production.yml logs db

# Actualizar aplicación
git pull origin main
docker-compose -f docker-compose.production.yml up -d --build
```

### Backup de Base de Datos
```bash
# Crear backup manual
docker-compose -f docker-compose.production.yml exec db pg_dump -U portal_admin portal_sandoval_omv > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose -f docker-compose.production.yml exec -T db psql -U portal_admin portal_sandoval_omv < backup_file.sql
```

## 🛡️ Consideraciones de Seguridad

### 1. Firewall (Opcional)
Si quieres restringir el acceso solo a tu red local:
```bash
# Permitir acceso solo desde tu red (ajusta la IP según tu red)
sudo ufw allow from 192.168.1.0/24 to any port 8080
sudo ufw allow from 192.168.1.0/24 to any port 3001
sudo ufw enable
```

### 2. Cambiar Credenciales
1. Accede al admin: `http://IP-DE-TU-OMV:8080/admin/`
2. Ve a "Users" → "admin"
3. Cambia la contraseña
4. Actualiza el email si es necesario

### 3. Configurar Backup Automático
```bash
# Crear script de backup
sudo nano /usr/local/bin/portal-backup.sh

# Contenido del script:
#!/bin/bash
BACKUP_DIR="/srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/portal-sandoval/postgres_backups"
DATE=$(date +%Y%m%d_%H%M%S)
cd /srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/compose/portal-sandoval
docker-compose -f docker-compose.production.yml exec -T db pg_dump -U portal_admin portal_sandoval_omv > "$BACKUP_DIR/backup_$DATE.sql"
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 -delete

# Hacer ejecutable
sudo chmod +x /usr/local/bin/portal-backup.sh

# Programar backup diario (2 AM)
echo "0 2 * * * /usr/local/bin/portal-backup.sh" | sudo crontab -
```

## 🔍 Monitoreo

### Verificar Recursos
```bash
# Ver uso de recursos
docker stats

# Ver espacio en disco
df -h /srv/dev-disk-by-uuid-9cac2098-d700-46fa-82a3-0835758908e6/

# Ver logs del sistema
journalctl -u docker -f
```

### Monitoreo del RAID 1
```bash
# Verificar estado del RAID
cat /proc/mdstat

# Información detallada del RAID
sudo mdadm --detail /dev/md0

# Verificar salud de los discos
sudo smartctl -a /dev/sda
sudo smartctl -a /dev/sdb

# Monitoreo continuo del RAID (opcional)
watch -n 5 'cat /proc/mdstat'
```

### Alertas de RAID (Recomendado)
```bash
# Configurar alertas por email (opcional)
sudo nano /etc/mdadm/mdadm.conf
# Agregar: MAILADDR tu-email@ejemplo.com

# Habilitar monitoreo automático
sudo systemctl enable mdmonitor
sudo systemctl start mdmonitor
```

### Healthchecks
Los contenedores incluyen healthchecks automáticos. Verifica el estado:
```bash
docker-compose -f docker-compose.production.yml ps
```

## 🎉 ¡Listo!

Tu Portal Sandoval está optimizado para tu OpenMediaVault con:
- ✅ Puertos sin conflictos con tus servicios existentes
- ✅ Almacenamiento en tu disco específico
- ✅ Configuración de recursos apropiada para NAS
- ✅ Backups automáticos configurables
- ✅ Monitoreo y logs optimizados

**Accesos después del despliegue:**
- Frontend: `http://IP-DE-TU-OMV:3001`
- Admin: `http://IP-DE-TU-OMV:8080/admin/`

¡Disfruta tu nueva aplicación de gestión de clientes en tu OpenMediaVault! 🚀
