from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Client
from tasks.models import Task
from decimal import Decimal
from django.db.models import Sum

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo User. Lo usaremos para mostrar los datos del usuario
    asociado a un cliente, pero sin exponer datos sensibles como la contraseña.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ClientSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Client.
    Convierte los objetos Client a JSON y viceversa.
    """
    # Usamos el UserSerializer para mostrar la información del usuario de forma anidada y legible.
    # read_only=True significa que este campo se usará para mostrar datos, no para escribirlos directamente.
    user = UserSerializer(read_only=True)

    # Campos calculados para los costes del cliente. Son de solo lectura.
    initial_cost = serializers.SerializerMethodField()
    extra_cost = serializers.SerializerMethodField()
    total_cost = serializers.SerializerMethodField()
    
    # Añadimos campos que no están en el modelo Client, pero que necesitamos para crear el User asociado.
    # write_only=True significa que estos campos solo se aceptan al crear/actualizar (POST/PUT),
    # pero no se mostrarán al solicitar datos (GET).
    # Hacemos que no sean requeridos para permitir la actualización parcial (PATCH).
    email = serializers.EmailField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'}, allow_blank=True)
    username = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Client
        # Definimos todos los campos que nuestra API va a manejar para un cliente.
        fields = [
            'id', 'user', 'business_name', 'contact_name', 'phone', 
            'internal_notes', 'created_at', 'updated_at', 'is_active',
            # Añadimos los nuevos campos de coste
            'initial_cost', 'extra_cost', 'total_cost',
            'username', 'email', 'password' # Incluimos los campos de solo escritura
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        # Para la creación, los datos de acceso son obligatorios.
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        password = validated_data.pop('password', None)

        if not all([username, email, password]):
            raise serializers.ValidationError({
                "detail": "El nombre de usuario, email y contraseña son obligatorios para crear un nuevo cliente."
            })

        # Extraemos los datos para el usuario y creamos el objeto User.
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        # Con el resto de los datos, creamos el objeto Client, asociándolo al usuario.
        client = Client.objects.create(user=user, **validated_data)
        return client

    def update(self, instance, validated_data):
        """
        Personaliza la lógica de actualización.
        Esto nos permite editar el cliente y su usuario asociado de forma segura.
        """
        # Actualizamos los campos del modelo Client (business_name, phone, etc.)
        instance.business_name = validated_data.get('business_name', instance.business_name)
        instance.contact_name = validated_data.get('contact_name', instance.contact_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.internal_notes = validated_data.get('internal_notes', instance.internal_notes)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()

        # Actualizamos los campos del modelo User si se proporcionaron.
        user = instance.user
        # Solo actualizamos si se envió un valor no vacío.
        if validated_data.get('username'):
            user.username = validated_data.get('username')
        if validated_data.get('email'):
            user.email = validated_data.get('email')
        
        # Importante: Solo actualizamos la contraseña si se envió una nueva.
        # El campo no debe estar vacío.
        if validated_data.get('password'):
            user.set_password(validated_data['password'])
        user.save()

        return instance

    def get_initial_cost(self, obj):
        """Suma los costes base de todos los proyectos del cliente."""
        return obj.projects.aggregate(total=Sum('initial_cost'))['total'] or Decimal('0.00')

    def get_extra_cost(self, obj):
        """Suma los costes de todas las tareas de todos los proyectos del cliente."""
        # Buscamos todas las tareas cuyo proyecto pertenece a este cliente.
        return Task.objects.filter(project__client=obj).aggregate(total=Sum('cost'))['total'] or Decimal('0.00')

    def get_total_cost(self, obj):
        """Suma el coste inicial y los costes extra."""
        initial = self.get_initial_cost(obj)
        extra = self.get_extra_cost(obj)
        return initial + extra