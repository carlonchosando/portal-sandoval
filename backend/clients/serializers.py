from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Client

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
    
    # Añadimos campos que no están en el modelo Client, pero que necesitamos para crear el User asociado.
    # write_only=True significa que estos campos solo se aceptan al crear/actualizar (POST/PUT),
    # pero no se mostrarán al solicitar datos (GET).
    email = serializers.EmailField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    username = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Client
        # Definimos todos los campos que nuestra API va a manejar para un cliente.
        fields = [
            'id', 'user', 'business_name', 'contact_name', 'phone', 
            'internal_notes', 'created_at', 'updated_at',
            'username', 'email', 'password' # Incluimos los campos de solo escritura
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        # Extraemos los datos para el usuario y creamos el objeto User.
        user = User.objects.create_user(
            username=validated_data.pop('username'),
            email=validated_data.pop('email'),
            password=validated_data.pop('password')
        )
        # Con el resto de los datos, creamos el objeto Client, asociándolo al usuario.
        client = Client.objects.create(user=user, **validated_data)
        return client