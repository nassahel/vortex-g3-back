# LuxShop Ecommerce

## Descripción
LuxShop Ecommerce es una plataforma de comercio electrónico que permite la compra de productos con dos roles de usuario: **Usuario** y **Administrador**. Incluye funcionalidades como:
- Registro e inicio de sesión con JWT
- Recuperación de contraseña
- Carrito de compras y descuentos automáticos de stock
- Generación de estadísticas
- Envío de correos electrónicos
- Panel de administración para usuarios, productos y categorías

## Tecnologías utilizadas
- **NestJS** - Framework para Node.js
- **JWT** - Autenticación basada en tokens
- **Prisma** - ORM para la gestión de bases de datos
- **Bcrypt** - Cifrado de contraseñas
- **i18n** - Internacionalización y validaciones de datos
- **Swagger** - Documentación de la API
- **AWS** - Servicios en la nube

## Requisitos previos
Antes de comenzar, asegúrate de tener instalado:
- **Node.js** (versión recomendada: 16+)
- **PostgreSQL** como base de datos
- **Docker** (opcional, para entorno de desarrollo)

## Instalación y configuración
1. Clonar el repositorio:
   ```sh
   git clone https://github.com/tu-usuario/luxshop-ecommerce.git
   cd luxshop-ecommerce
   ```
2. Instalar dependencias:
   ```sh
   npm install
   ```
3. Configurar las variables de entorno:
   ```sh
   cp .env.example .env
   ```
   Luego, edita el archivo `.env` con la configuración de la base de datos y otros servicios.

4. Generar la base de datos con Prisma:
   ```sh
   npx prisma migrate dev
   ```
5. Ejecutar el proyecto:
   ```sh
   npm run start:dev
   ```

## Documentación de la API
LuxShop cuenta con documentación generada automáticamente con **Swagger**. Una vez el servidor esté en ejecución, accede a:
```
http://localhost:8000/api-docs
```

## Endpoints principales
### Autenticación
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesión
- `POST /auth/recover-password` - Recuperación de contraseña

### Productos
- `GET /products` - Listar productos
- `POST /products` - Crear producto (Admin)
- `PUT /products/:id` - Editar producto (Admin)
- `DELETE /products/:id` - Eliminar producto (Admin)

### Carrito
- `POST /cart/add` - Agregar producto al carrito
- `GET /cart` - Ver carrito
- `POST /cart/checkout` - Procesar compra

### Estadísticas
- `GET /stats/sales` - Reportes de ventas
- `GET /stats/users` - Reportes de usuarios

## Despliegue
Para desplegar en producción, se recomienda usar **Docker** y configurar un servicio en **AWS**. 

## Contribución
Si deseas contribuir, por favor abre un **Issue** o envía un **Pull Request**.

## Licencia
Este proyecto **no cuenta con una licencia específica**.
