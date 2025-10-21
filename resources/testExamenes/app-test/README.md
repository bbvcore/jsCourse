# Test APP
## Versión JS
Esta versión del test de exámenes esta basado en **HTML/JS** para el lado del Cliente y para el lado del Servidor también hace uso de JS con NodeJS como Backend. Además la persistencia de datos se lleva a cabo con el SGBD open source MariaDB.

## Estructura
La aplicación consta con la siguiente estructura:
- **node_modules**: contiene los módulos de necesarios, que en este caso son **express**, **cors** y **mysql2** *(para poder usar promesas con MySQL/MariaDB)*.
- **server.js**: es el fichero responsable del servidor donde está implementado el endpoint que extrae los datos del servidor de base de datos.
- **index.html**: es el documento web responsable del frontend para la interacción con el usuario.

## Anexo
Además se incluye un **CRUD** para gestionar las preguntas y las respuestas mediante el fichero **crud.js**, mediante endpoints de una API se pueden llevar a cabo 
las principales operaciones sobre la base de datos.


