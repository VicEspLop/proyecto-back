require("dotenv").config();
const {MongoClient, ObjectId} = require("mongodb");

//creamos la función para la conexión con la BBDD
function conectar(){
    return MongoClient.connect(process.env.DB_MONGO);
}


//creamos una función para leer las tareas
function getTareas(){
    return new Promise(async (fulfill,reject) => {
        
        try{//creamos una nueva conexion que sale de esperar a conectar()
            let conexion = await conectar();

            let todo = conexion.db("todo").collection("todo");

            let tareas = await todo.find({}).toArray(); //retorna una promesa

            conexion.close();

            fulfill(tareas);

        }catch(error){//si hay algún error saldremos por aquí
            
            reject({error : "error en BBDD"});
        }
    })
}

//creamos una función para crear las tareas
function crearTarea(tarea){ //extraemos la tarea de peticion.body
    return new Promise(async (fulfill,reject) => {
        
        try{//creamos una nueva conexion que sale de esperar a conectar()
            let conexion = await conectar();
            
            let todo = conexion.db("todo").collection("todo");
            
            tarea.terminada = false;

            let {insertedId} = await todo.insertOne(tarea);

            conexion.close();

        
            fulfill({id : insertedId});

        }catch(error){

            reject({error : "error en BBDD"});
        }
    })

}

//creamos una función para borrar las tareas
function borrarTarea(id){
    return new Promise( async (fulfill,reject) => {

        try{//creamos una nueva conexion que sale de esperar a conectar()
            let conexion = await conectar();
        
             
            let todo = conexion.db("todo").collection("todo");

           
            let {deletedCount} = await todo.deleteOne({_id : new ObjectId(id)});

            conexion.close();

            
            fulfill(deletedCount);            

        }catch(error){

            reject({error : "error en BBDD"})
        }
    })
}

//creamos una función para actualizar el estado
function actualizarEstado(id){
    return new Promise( async (fulfill,reject) => {

        try{//creamos una nueva conexion que sale de esperar a conectar()
            let conexion = await conectar();

           
            let todo = conexion.db("todo").collection("todo");

           
            let tarea = await todo.findOne({_id : new ObjectId(id)});

           
            let nuevoEstado = !tarea.terminada;

           
            let actualizar = await todo.updateOne({_id : new ObjectId(id)}, {$set : {terminada : nuevoEstado}});

           
            conexion.close();

            //vemos si realmente se ha modificado la tarea
            if(actualizar.modifiedCount === 1){

                fulfill(actualizar.modifiedCount);

            }else{

                throw new Error("No se pudo actualizar la tarea");

            }

        }catch(error){

            reject({error : "error en BBDD"})
        }
    })
}

//creamos una función para actualizar el texto
function actualizarTexto(id,tarea){
    return new Promise( async (fulfill,reject) => {
        
        try{

            let conexion = await conectar();

            let todo = conexion.db("todo").collection("todo");

       
            let actualizar = await todo.updateOne({_id : new ObjectId(id)}, {$set : {tarea : tarea}});

             
             conexion.close();

         
             fulfill(actualizar);

        }catch(error){

            reject({error : "error en BBDD"})
        }
    })
}




module.exports = {getTareas,crearTarea,borrarTarea,actualizarEstado,actualizarTexto}