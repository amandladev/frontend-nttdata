# NTT Data - Challenge - Frontend

## 🌐 Aplicación Angular para Registro, Login y Listado de Usuarios

## 🚀 Descripción general
Este es el frontend del challenge, desarrollado con **Angular 18**, que permite a los usuarios registrarse, iniciar sesión y visualizar una lista de usuarios. La aplicación consume las APIs serverless del backend y gestiona el flujo de autenticación mediante **JWT**.

---

## 🛠️ Tech Stack
- **Angular 18** → Framework principal para el frontend
- **Angular Material** → Algunos estilos y componentes
- **Bootstrap 5** → Diseño responsivo y estilos base
- **Jasmine/Karma** → Framework de testing para unit tests

---

## 📂 Estructura del Proyecto
```
src/
|-- app/
|   |-- components/
|   |   |-- login/
|   |   |-- register/
|   |   |-- user-list/
|   |-- services/
|   |-- guards/
|-- assets/
|-- environments/
|-- main.ts
|-- app.module.ts
```

---

## 🛠️ Setup & Instalación

### 1️⃣ Clonar el Repositorio
```sh
git clone <repo-url>
cd frontend
```

### 2️⃣ Instalar Dependencias
```sh
npm install
```

### 3️⃣ Configurar API URL
Editar el archivo `environments/environment.ts` y ajustar la URL del backend:
```typescript
export const environment = {
  production: false,
  encryptPassword: 'password_encrypt'
  apiUrl: 'http://localhost:3000/api' // Cambiar si es necesario
};
```

### 4️⃣ Ejecutar en modo desarrollo
```sh
ng serve
```
La aplicación estará disponible en:
```
http://localhost:4200
```

---

## 🗒️ Funcionalidades

### Login Page
📍 Permite que un usuario registrado inicie sesión.  
📍 Si el login es exitoso, guarda el token JWT y redirige al listado de usuarios.  
📍 Validaciones en tiempo real para email y contraseña.

---

### Register Page
📍 Permite registrar un nuevo usuario.  
📍 Formulario reactivo con validaciones: nombre, email, teléfono, contraseña y confirmación.  
📍 Muestra mensajes de error en caso de validaciones fallidas.

---

### User List Page (Ruta protegida)
📍 Solo accesible si el usuario está autenticado (tiene un token válido).  
📍 Muestra el listado de usuarios recuperados desde el backend.  
📍 Si no hay token, redirige automáticamente a la pantalla de login.

---

## 🔒 Autenticación
La aplicación gestiona la autenticación con **JWT**, de la siguiente manera:  
✔️ Al hacer login, el token se guarda en el **LocalStorage**.  
✔️ El **AuthGuard** protege rutas sensibles (como el listado de usuarios).  
✔️ Al cerrar sesión, el token se elimina del navegador.

---

## 🧪 Testing
La aplicación incluye tests unitarios usando **Jasmine y Karma**.  
Para ejecutarlos:
```sh
ng test
```

---

## 📆 Build y Despliegue
Para generar el build listo para producción:
```sh
ng build --configuration=production
```
Esto genera los archivos optimizados en:
```
dist/
```
Estos archivos pueden ser servidos por cualquier servidor web (Nginx, Apache, S3, etc).

---

## ✅ Features
✔️ Desarrollado con Angular 18 
✔️ Formularios Reactivos  
✔️ Autenticación con JWT  
✔️ Protección de rutas con AuthGuard  
✔️ Consumo de APIs desde un backend Serverless  
✔️ Diseño responsive usando Bootstrap 5  
✔️ Pruebas unitarias con Jasmine y Karma

