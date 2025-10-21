/*
App: CRUD para la gestión de la APP para generar tests de preguntas
Author: Borja Bas Ventín
*/
//-------------------------------------------------------------
// 1. Módulos Database
//-------------------------------------------------------------
const mysql = require('mysql2');

//-------------------------------------------------------------
// Database
//-------------------------------------------------------------
const con = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: 'parrot',
    database: 'test'
});

con.connect((error) =>{
    error ? "Error al conectar a la base de datos:"+ error  : "Conectado correctamente a la base de datos"
});

//-------------------------------------------------------------
// 2. Módulos del CRUD
//-------------------------------------------------------------
const express = require('express');
const PORT = 5001;
const app = express();
app.use(express.urlencoded({ extended: true }));

//-------------------------------------------------------------
// 3. ENDPOINTS del CRUD para tabla QUESTIONS
//-------------------------------------------------------------
// 3.0. Menú del CRUD
//-----------------------------------------------------------
app.get('/', (req,res)=>{
    res.send(`
    <h3>Opciones de la APP</h3>
    <a href="all-questions">Lista de preguntas</a>
    `);
})

// 3.1. Listar todas las preguntas
//-------------------------------------------------------------
app.get('/all-questions', (req, res) =>{
// El método query usa 3 parámetros (sentencia, lista parámetros [], callback (error, resultados, metadatos campos (fields)
    con.query("Select * from questions", (error,rs)=>{
    let htmlData = `<h3>Lista de registros</h3><ul> `;
        rs.forEach(current => {
        htmlData += `
            <li>
            <!-- Obtener el ID de las preguntas para poder asociarlo a la operación CRUD -->
                ${current.idQuestion}: ${current.question}
                <a href="/data-questions/${current.idQuestion}/update">Editar</a> |
                <a href="/data-questions/${current.idQuestion}/delete">Eliminar</a> |
                <a href="/all-answers/${current.idQuestion}">Ver respuestas</a>
              </li>
        `;
});
htmlData+="</ul>";
    res.send(htmlData);
});
});


// 3.2. Formulario para la nueva pregunta
//-----------------------------------------------------------
app.get('/new-question',(req,res)=>{
    res.send(`
        <h3>Añadir pregunta</h3>
        <form method="POST" action="all-data">
            <input type="text" name="question" placeholder="Introducir una pregunta" required><br>
            <input type="text" name="correctId" placeholder="Introducir la respuesta correcta" required><br>
            <input type="text" name="explication" placeholder="Introducir una explicación" required><br>
            <button type="submit">Añadir</button>
        </form>
        `);
})

// 3.3. Añadir la pregunta a la base de datos
app.post('/all-questions',(req,res)=>{
        // Obención de los datos a introducir del formulario html mediante el método POST
        const {question, correctId, explication} = req.body;
        // Construir consulta SQL 
        con.query("insert into questions (question, correctAnswerId, explication) values (?,?,?)",[question, correctId, explication],(error)=>{
        console.error("Ha habido problemas para insertar los datos en la tabla");
        res.redirect('/all-questions'); // Redirección al endpoint
    });
});

// 3.4 Update a la pregunta
// Método GET para acceder y mostrar formulario
app.get('/data-questions/:id/update', (req, res)=>{
    const id = req.params.id;
    const SQL = "Select * from questions where idQuestion = ?";
    const VALUES = [id];

    con.query(SQL, VALUES, (error ,rs, fields)=>{
        if (error){
        console.error("Se ha producido un error en el formulario para el UPDATE", error);
        return res.send("Error con la carga del formulario para el UPDATE");
        }
    

    const question = rs[0]; // Primer registro encontrado

    res.send(`
        <h3>Update de la pregunta</h3>
              <form method="POST" action="/all-questions/${id}/update">
                <input type="text" name="question" value="${question.question}" required><br>
                <input type="text" name="correctId" value="${question.correctAnswerId}" required><br>
                <input type="text" name="explication" value="${question.explication}" required><br>
                <button type="submit">Update</button>
            </form>
        `);
    });
});



// Método POST que procesa los datos del formulario para realizar la consulta de SQL para el UPDATE
app.post('/data-questions/:id/update',(req, res)=>{
    const id = req.params.id; // Obtener el id de params vía URL
    const { question, correctId, explication } = req.body // Obtener valores de la tabla de preguntas a través del body
    // Consulta de actualización
    const SQL = "UPDATE questions SET question=?, correctAnswerId=?, explication=? WHERE idQuestion=?";
    const VALUES = [question, correctId, explication,id]
    con.query(SQL, VALUES, (error)=>{
        if (error){
        res.send("ERROR!, no se ha podido actualizar");
        }
        res.redirect('/all-questions');
    });
})

// 3.5 Eliminar preguntas
app.get('/data-questions/:id/delete',(req, res)=>{
    const id = req.params.id;
    const SQL = "delete from questions where idQuestion = ?";
    const VALUES = [id];
    con.query(SQL, VALUES, (error) => {
        error ? console.error("Se ha producido un error") : console.log("Registro eliminado correctamente");
        res.redirect('/all-questions');
    });

});



//-------------------------------------------------------------
// 4. ENDPOINTS del CRUD para la tabla ANSWERS
//-------------------------------------------------------------
// 4.0. Todas las respuestas
//-----------------------------------------------------------
app.get('/all-answers/',(req, res)=>{
    const SQL = "select * from answers";
    con.query(SQL,  (error, rs, fields)=>{
        error ? console.error (error) : console.log("Se han mostrado correctamente todas las respuestas");
        // Render answers
        let htmlAnswers = `
                <h3>Lista de respuestas</h3> 
                <p>Id Question | Id Answer | Answer </p>
                `;
        rs.forEach(current => {
        htmlAnswers += `
             <p>
                ${current.idQuestion} | ${current.idAnswer} | ${current.answer}
              </p>
        `;
   
          });

        res.send(htmlAnswers);
    });
});


// 4.1. Respuestas asociadas al id de una question
//-----------------------------------------------------------
app.get('/answer/:idQuestion',(req, res)=>{
    // Se almacena el id de la tabla Questions para poder acceder a las respuestas asociadas
    const idQuestion = req.params.idQuestion;
    const SQL = "select * from answers where idQuestion = ?";
    const VALUES = [idQuestion];
    con.query(SQL, VALUES, (error, rs, fields)=>{
        error ? console.error (error) : console.log("Se han mostrado correctamente todas las respuestas");
        
        // Render answers
        let htmlAnswers = `
            <h3>Respuestas asociadas a la pregunta ${idQuestion}</h3>
            <a href="/all-questions">Listado de preguntas</a> |
            <a href="/all-answers">Listado de respuestas</a> |
            <a href="/data-answers/new/${idQuestion}">Añadir una nueva respuesta</a>
            <ul>
        `;
        rs.forEach((current)=>{
            htmlAnswers += `
                <li>${current.answer}
                    <a href="/data-answers/${current.idAnswer}">Editar</a>
                    <a href="/data-answers/${current.idAnswer}">Delete</a>
                </li>
            `
        });
        htmlAnswers += "</ul>";
        res.send(htmlAnswers);
    });
});

// 4.2 Añadir una nueva respuesta
//-----------------------------------------------------------
// Formulario para insertar una nueva respuesta
app.get('/answer/new/:idQuestion',(req, res)=>{
    const idQuestion = req.params.idQuestion;
    res.send(`
        <h3>Nueva respuesta</h3>
            <form method="POST" action="/answer">
                <b>Id Question</b><br>
                <input type="text" name="idQuestion" value="${idQuestion}"><br><br>
                <b>Nueva respuesta</b><br>
                <input type="text" name="answer" placeholder="Escribir una nueva respuesta" required><br><br>
                <button type="submit">Añadir nueva respuesta</button>
            </form>
        `);
});

// Método Post que realiza la inserción
app.post('/answer',(req,res)=>{
    const {answer, idQuestion} = req.body;
    SQL = "insert into answers (answer, idQuestion) values (?,?)";
    VALUES = [answer, idQuestion];
    con.query(SQL, VALUES, (error, rs, fields)=>{
        error ? console.error("Falló: ", error) : console.log("Insertada la respuesta correctamente");
        res.redirect(`/answer/${idQuestion}`);
    });
});

// 4.3 Editar la respuesta
//-----------------------------------------------------------
app.get('/answer/:id/edit',(req,res)=>{
    const id = req.params.id;
    const SQL = "SELECT * FROM answers WHERE idAnswer = ?";
    const VALUES = [id];
    con.query(SQL, VALUES, (error, results, fields)=>{
    if (error || results.length === 0) {
            console.error("No se encontro nada para editar, error: ", error);
            return res.send("Error: no se ha encontrado nada para editar");
        }
        const rs = results[0];

        res.send(`
            <h3>Editar respuesta</h3>
            <form method="POST" action="/answer/${id}/update">
                <input type="text" name="answer" value="${rs.answer}"><br>
                <input type="hidden" name="idQuestion" value="${rs.idQuestion}"><br>
                <button type="submit">Update</button>
            </form>
            `);
    });
});

// 4.4 Actualizar la respuesta
//-----------------------------------------------------------
app.post('/answer/:id/update', (req, res)=>{
    const id = req.params.id;
    const { answer, idQuestion } = req.body;
    const SQL = "UPDATE answers SET answer=? WHERE idAnswer=?";
    const VALUES = [answer, id];
    con.query(SQL, VALUES, (error) =>{
        error ? console.error("No se pudo actualizar: ", error) : console.log("Perfecto, Update OK");
        res.redirect(`/answer/${idQuestion}`);
    });

});

// 4.5 Eliminar respuesta
//-----------------------------------------------------------
app.get('/answer/:id/delete', (req, res)=>{
    const id = req.params.id;
    const SQL = "select * from answers where idAnswer = ?";
    const VALUES = [id];
    con.query(SQL, VALUES, (error, rs) =>{
        error ? console.error("No se pudo encontrar: ", error) : console.log("Perfecto, encontrado OK");
        const idQuestion = rs[0].idQuestion;

        const SQL2= "Delete from answers where idAnswer=?";
        con.query(SQL2, VALUES, (error2) =>{
        error2 ? console.error("No se pudo eliminar: ", error2) : console.log("Perfecto, eliminación OK");
        res.redirect(`/answer/${idQuestion}`);
    });
});
});



//-----------------------------------------------------------
// 5. Servidor de la APP
//-----------------------------------------------------------
app.listen(PORT,()=>{
    console.log("Servidor CRUD: Status OK")
    });

