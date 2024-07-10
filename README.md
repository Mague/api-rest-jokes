# API REST JOKES

## Descripción

Esta API permite gestionar chistes de Chuck Norris y chistes de "Dad" a través de varios endpoints. Incluye funcionalidades para crear, actualizar, eliminar y obtener chistes, así como gestionar usuarios y temas.

## Requisitos

- Node.js (>= 14.x)
- Docker y Docker Compose
- PostgreSQL
- Axios
- Jest

## Configuración del Proyecto

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Mague/api-rest-jokes.git
cd api-rest-jokes
```

### 2. Instalación de Dependencias

Instala las dependencias del proyecto usando npm:

```bash
npm install
```

### 3. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
POSTGRES_USER=
POSTGRES_PASS=
POSTGRES_NAME=
DB_HOST=
DB_PORT=
JWT_SECRET=tu_secreto_jwt
PORT=3000
```

Asegúrate de reemplazar `user`, `password`, `localhost`, y `mydb` con los valores correctos para tu configuración de PostgreSQL.

### 4. Levantar Servicios con Docker

El proyecto incluye un archivo `docker-compose.yml` para levantar los servicios necesarios (PostgreSQL y pgAdmin). Ejecuta el siguiente comando para levantar los servicios:

```bash
docker-compose up -d
```

Este comando levantará los servicios de PostgreSQL y pgAdmin en segundo plano.

### 5. Sincronización de la Base de Datos

Ejecuta el siguiente comando para sincronizar la base de datos:

```bash
npm run dev
```
```


await User.sync({ force: true });
await Theme.sync({ force: true });
await Joke.sync({ force: true });
// Registra los modelos
// Definir las asociaciones después de inicializar los modelos
Joke.belongsToMany(Theme, { through: 'joke_themes' });
Theme.belongsToMany(Joke, { through: 'joke_themes' });
await sequelize.sync({
  force: true,
  logging: console.log // Esto imprimirá las consultas SQL en la consola
});
```
### 6. Ejecutar la API

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000`.

## Ejecución de Pruebas

Para ejecutar las pruebas unitarias, usa el siguiente comando:

```bash
npm run test
```

Para generar un informe de cobertura de pruebas:

```bash
npm run test:coverage
```

## Endpoints Disponibles

### Swagger
- **Documentacion** `GET /api-docs`
### Usuarios

- **Registro de Usuario**: `POST /users/register`
- **Inicio de Sesión**: `POST /users/login`

### Temas

- **Crear Tema**: `POST /themes`
- **Obtener Temas**: `GET /themes`

### Chistes

- **Obtener Chiste Aleatorio**: `GET /jokes/:type?`
  - `type` puede ser `Chuck` o `Dad`
- **Crear Chiste**: `POST /jokes`
- **Actualizar Chiste**: `PUT /jokes/:id`
- **Eliminar Chiste**: `DELETE /jokes/:id`

## Estructura del Proyecto

```plaintext
src/
├── controllers/      # Controladores de la API
├── models/           # Modelos de Sequelize
├── routes/           # Rutas de la API
├── services/         # Servicios para integraciones externas
├── middleware/       # Middleware de la API
├── tests/            # Pruebas unitarias
├── db.ts             # Configuración de la base de datos
├── index.ts          # Punto de entrada de la aplicación
└── swagger.yaml      # Documentación de la API
```

## Dependencias

- **express**: Framework web para Node.js
- **sequelize**: ORM para Node.js
- **pg**: Módulo de PostgreSQL para Node.js
- **axios**: Cliente HTTP para realizar peticiones a las APIs de Chuck Norris y Dad
- **jsonwebtoken**: Para manejo de autenticación basada en tokens
- **jest**: Framework de pruebas unitarias
- **supertest**: Para pruebas de endpoints HTTP

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para cualquier mejora o corrección.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
