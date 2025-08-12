# 🚀 Guía de Despliegue en OpenMediaVault - Portal Sandoval

Esta guía te ayudará a desplegar Portal Sandoval en tu servidor OpenMediaVault usando Docker Compose.

## 📋 Requisitos Previos

- OpenMediaVault instalado y configurado
- Plugin **openmediavault-compose** instalado
- Acceso SSH al servidor OMV
- Al menos 2GB de RAM disponible
- 5GB de espacio libre en disco

## 🔧 Preparación del Entorno

### 1. Instalar Docker y Docker Compose en OMV

Si no tienes Docker instalado:

```bash
# Conectarse por SSH al servidor OMV
ssh tu-usuario@ip-del-omv

# Instalar Docker (si no está instalado)
sudo apt update
sudo apt install docker.io docker-compose -y

# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o ejecutar:
newgrp docker
```

### 2. Preparar Directorios de Datos

```bash
# Encontrar el UUID de tu disco principal
sudo blkid

# Crear directorio base para Portal Sandoval
# Reemplaza YOUR-UUID con el UUID real de tu disco
sudo mkdir -p /srv/dev-disk-by-uuid-YOUR-UUID/portal-sandoval

# Crear subdirectorios necesarios
sudo mkdir -p /srv/dev-disk-by-uuid-YOUR-UUID/portal-sandoval/{postgres_data,postgres_backups,static,media,logs}

# Dar permisos apropiados
sudo chown -R 1000:1000 /srv/dev-disk-by-uuid-YOUR-UUID/portal-sandoval
sudo chmod -R 755 /srv/dev-disk-by-uuid-YOUR-UUID/portal-sandoval
```

## 📦 Despliegue de la Aplicación

### 3. Clonar el Repositorio

```bash
# Ir al directorio de trabajo
cd /home/tu-usuario

# Clonar el repositorio
git clone https://github.com/carlonchosando/portal-sandoval.git
cd portal-sandoval
```

### 4. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.openmediavault.example .env

# Editar el archivo .env
nano .env
```

**Configuraciones importantes a cambiar:**

1. **SECRET_KEY**: Genera una nueva clave secreta
2. **POSTGRES_PASSWORD**: Usa una contraseña fuerte
3. **DJANGO_SUPERUSER_PASSWORD**: Cambia la contraseña del admin
4. **OMV_DATA_PATH**: Reemplaza YOUR-UUID con tu UUID real
5. **DJANGO_ALLOWED_HOSTS**: Agrega la IP de tu servidor OMV

### 5. Generar Clave Secreta de Django

```bash
# Generar una nueva SECRET_KEY
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 6. Encontrar el UUID de tu Disco

```bash
# Listar discos y sus UUIDs
sudo blkid | grep -E "(ext4|xfs|btrfs)"

# O usar lsblk
lsblk -f
```

### 7. Desplegar la Aplicación

```bash
# Construir y levantar los servicios
docker-compose -f docker-compose.production.yml up -d

# Verificar que los contenedores están ejecutándose
docker-compose -f docker-compose.production.yml ps

# Ver logs en tiempo real
docker-compose -f docker-compose.production.yml logs -f
```

## 🌐 Acceso a la Aplicación

Una vez desplegada, podrás acceder a:

- **Frontend React**: `http://IP-DE-TU-OMV:3001`
- **Backend Admin**: `http://IP-DE-TU-OMV:8080/admin/`
- **API REST**: `http://IP-DE-TU-OMV:8080/api/v1/`

### Credenciales Iniciales

- **Usuario**: admin (o el que configuraste en DJANGO_SUPERUSER_USERNAME)
- **Contraseña**: ChangeMe123! (o la que configuraste en DJANGO_SUPERUSER_PASSWORD)

**⚠️ IMPORTANTE**: Cambia estas credenciales inmediatamente después del primer acceso.

## 🔍 Monitoreo y Mantenimiento

### Verificar Estado de los Servicios

```bash
# Ver estado de contenedores
docker-compose -f docker-compose.production.yml ps

# Ver logs de un servicio específico
docker-compose -f docker-compose.production.yml logs backend
docker-compose -f docker-compose.production.yml logs frontend
docker-compose -f docker-compose.production.yml logs db

# Ver uso de recursos
docker stats
```

### Comandos Útiles

```bash
# Parar todos los servicios
docker-compose -f docker-compose.production.yml down

# Reiniciar servicios
docker-compose -f docker-compose.production.yml restart

# Actualizar la aplicación
git pull origin main
docker-compose -f docker-compose.production.yml up -d --build

# Backup de la base de datos
docker-compose -f docker-compose.production.yml exec db pg_dump -U portal_admin portal_sandoval_omv > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose -f docker-compose.production.yml exec -T db psql -U portal_admin portal_sandoval_omv < backup_file.sql
```

## 🛠️ Solución de Problemas

### Problemas Comunes

1. **Error de permisos en volúmenes**:
   ```bash
   sudo chown -R 1000:1000 /srv/dev-disk-by-uuid-YOUR-UUID/portal-sandoval
   ```

2. **Puerto ocupado**:
   - Cambiar puertos en el archivo `.env`
   - Verificar qué proceso usa el puerto: `sudo netstat -tulpn | grep :8080`

3. **Contenedor no inicia**:
   ```bash
   # Ver logs detallados
   docker-compose -f docker-compose.production.yml logs nombre-del-servicio
   ```

4. **Problemas de conectividad entre contenedores**:
   ```bash
   # Verificar red de Docker
   docker network ls
   docker network inspect portal_sandoval_network
   ```

### Logs Importantes

Los logs se almacenan en:
- Aplicación: `/srv/dev-disk-by-uuid-YOUR-UUID/portal-sandoval/logs/`
- Docker: `docker-compose logs`

## 🔒 Seguridad

### Recomendaciones de Seguridad

1. **Cambiar credenciales por defecto**
2. **Usar contraseñas fuertes**
3. **Configurar firewall** para limitar acceso a los puertos
4. **Actualizar regularmente** el sistema y las imágenes Docker
5. **Configurar backups automáticos**

### Configurar Firewall (Opcional)

```bash
# Permitir solo acceso desde tu red local
sudo ufw allow from 192.168.1.0/24 to any port 8080
sudo ufw allow from 192.168.1.0/24 to any port 3001
sudo ufw enable
```

## 📊 Optimización para NAS

### Configuraciones Específicas para OMV

- **Límites de recursos**: Configurados para hardware limitado
- **Volúmenes persistentes**: Almacenados en el sistema de archivos del NAS
- **Puertos no conflictivos**: Evitan interferir con servicios OMV
- **Logging optimizado**: Rotación automática de logs
- **Healthchecks**: Monitoreo automático de servicios

### Backup Automático (Opcional)

Crear script de backup automático:

```bash
# Crear script de backup
sudo nano /usr/local/bin/portal-backup.sh

#!/bin/bash
BACKUP_DIR="/srv/dev-disk-by-uuid-YOUR-UUID/portal-sandoval/postgres_backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f /home/tu-usuario/portal-sandoval/docker-compose.production.yml exec -T db pg_dump -U portal_admin portal_sandoval_omv > "$BACKUP_DIR/backup_$DATE.sql"
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +7 -delete

# Hacer ejecutable
sudo chmod +x /usr/local/bin/portal-backup.sh

# Agregar a crontab (backup diario a las 2 AM)
echo "0 2 * * * /usr/local/bin/portal-backup.sh" | sudo crontab -
```

## 🎉 ¡Listo!

Tu Portal Sandoval debería estar funcionando correctamente en OpenMediaVault. 

Para soporte adicional o reportar problemas, visita: [GitHub Repository](https://github.com/carlonchosando/portal-sandoval)

---

**Desarrollado con ❤️ para OpenMediaVault**
