/*
App: Test de preguntas
Author: Borja Bas Ventín
*/
//-----------------------------------------------------------------------------------------------
// Módulos
//-----------------------------------------------------------------------------------------------
const express = require('express');
const mysql = require('mysql2/promise'); // Para poder usar Promesas
const cors = require('cors');
const app = express();
const PORT = 5000;

//-----------------------------------------------------------------------------------------------
// Middlewares
//-----------------------------------------------------------------------------------------------
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//-----------------------------------------------------------------------------------------------
// Objeto de configuración de la base de datos 
//-----------------------------------------------------------------------------------------------
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'parrot',
    database: 'test'
};

//-----------------------------------------------------------------------------------------------
// Endpoint para obtener preguntas
//-----------------------------------------------------------------------------------------------
// En este caso serán 10 preguntas
app.get('/questions', async (req, res) => {
    try {
        //---------------------------------------------------------------------------
        //1. Conexión a MySQL con los datos del objeto previo
        //---------------------------------------------------------------------------
            const connection = await mysql.createConnection(dbConfig);

        //---------------------------------------------------------------------------
        //2. Obtener IDs
        //---------------------------------------------------------------------------
            // Obtener todos los registros (filas) de la tabla questions en un array
            const [rows] = await connection.query('SELECT idQuestion FROM questions');
            // Obtener los IDs de los registros extraidos de la tabla questions
            const allIds = rows.map(r => r.idQuestion);

        if (allIds.length === 0) {
            await connection.end();
            return res.status(404).json({ message: "No hay preguntas en la base de datos" });
        }

        //---------------------------------------------------------------------------
        //3. Escoger 10 preguntas (o si hay menos en DB, pues menos)
        //---------------------------------------------------------------------------
        const getRandomIds = (array, count) => { // array y coun numero elementos a sacar
            const aux = array.sort(() => Math.random() - 0.5); // sort posee un compare, y devuelve negativo, 0 o 1 en función si a>b, cada par de numeros obtiene un valor random que lo compara con 0, y no tiene nada que ver con el valor de a y b , igual o menor, math va entre 0 y 1, pero al restar va entre -0.5 y 0.5, se necesita valores negativos para que sort mezcle
            // si no se pone un a, b en los argumentos de la arrow, se usan dos valores undefined que funcionan igual para el compare de sort
            return aux.slice(0, Math.min(count, array.length)); // porción array desde 0 hasta 10, el 10 se obtiene con el minimo entre pedido y tamaño array
            // slice devuelve un array desde 0 hasta min, que puede ser 10, o array.length si es menor de 10, así si hay menos de 10 elementos sigue devolviendo preguntas y no casca app
        };
        const selectedIds = getRandomIds(allIds, 10);
        
        //---------------------------------------------------------------------------
        // 4. Extraer los datos de los 10 registros aleatorios
        //---------------------------------------------------------------------------
        // El ? (placeholder, 1 solo parámetro) carga los ids buscados, que son un array 
        // [variable] => siempre los [] son una lista de parámetros de los corchetes, aunque solo sea un valor lo que se pasa, siempre envuelta la variable en corchetes
        const [questions] = await connection.query(
            `SELECT 
                questions.idQuestion,
                questions.question,
                questions.correctAnswerId,
                questions.explication,
                answers.idAnswer,
                answers.answer
             FROM questions
             JOIN answers ON questions.idQuestion = answers.idQuestion
             WHERE questions.idQuestion IN (?)
             ORDER BY questions.idQuestion, answers.idAnswer;`,
            [selectedIds]
        );// ordena primero la cuestiones por id, todas las del mismo id, juntas y luego por id de respuesta, ordena todas las respuestas entre cada pregunta

        /*
        // Ejemplo resultado de la consulta SQL
     


        */
        // 5. Construrir objeto JSON para visualizar en frontend
        // Comprobable en: http://localhost:5000/questions         
        const questionsMap = {};
        questions.forEach(row => {
            if (!questionsMap[row.idQuestion]) {
                questionsMap[row.idQuestion] = {
                    idQuestion: row.idQuestion,
                    question: row.question,
                    correctAnswerId: row.correctAnswerId,
                    explication: row.explication,
                    answers: []
                };
            }
            questionsMap[row.idQuestion].answers.push({
                idAnswer: row.idAnswer,
                answer: row.answer
            });
        });

        // 6. Cierre de la conexión     
        await connection.end();
        //res.json(Object.values(questionsMap)); // devuelve array, que es lo que se consume en el front
        res.json(questionsMap); // json() convierte cualquier tipo de dato en un JSON válido y devuelve el objeto completo
    } catch (err) {
        console.error(err);
        res.status(500).send("ERROR!, se ha producido un error en la base de datos");
    }
});


//-----------------------------------------------------------------------------------------------
// Lanzar servidor
//-----------------------------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});
