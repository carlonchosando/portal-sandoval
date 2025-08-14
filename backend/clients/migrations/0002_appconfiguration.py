# Generated manually for AppConfiguration model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AppConfiguration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('app_name', models.CharField(default='Portal Sandoval', help_text='Nombre que aparecerá en el header y reportes', max_length=100, verbose_name='Nombre de la Aplicación')),
                ('favicon', models.ImageField(blank=True, help_text='Icono que aparecerá en la pestaña del navegador (16x16 o 32x32 px)', null=True, upload_to='config/favicons/', verbose_name='Favicon')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Última Actualización')),
            ],
            options={
                'verbose_name': 'Configuración de la Aplicación',
                'verbose_name_plural': 'Configuración de la Aplicación',
            },
        ),
    ]
