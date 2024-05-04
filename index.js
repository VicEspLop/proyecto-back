require("dotenv").config();
const express = require("express");
const {json} = require("body-parser");
const cors = require("cors");

//traemos la función de bd
const{getTareas,crearTarea,borrarTarea,actualizarEstado,actualizarTexto} = require("./db")

const app = express();

app.use(cors());

app.use(json());

app.use("/probamos", express.static("./pruebas"));

app.get("/todo", async(peticion,respuesta) => {

    try{

        let tareas = await getTareas();

        tareas = tareas.map(({_id,tareas}) => {return {id: _id,tareas}});

        respuesta.json(tareas);

    }catch(error){
        respuesta.status(500);
        respuesta.json(error);
    }
});

app.post("/todo/crear", async (peticion,respuesta,siguiente) => {

    let {tarea} = peticion.body; 

    if(tarea && tarea.trim() != ""){
        try{

            let id = await crearTarea({tarea});

            return respuesta.json({id});

        }catch(error){
            respuesta.status(500);
            return respuesta.json(error);
        }
    }

    siguiente({error : "Falta el argumento en el objeto JSON"})
    
});

app.put("/todo/actualizar/:id([a-f0-9]{24})/:operacion(1|2)", async (peticion,respuesta) => {

    let operacion = Number(peticion.params.operacion); 

    let operaciones = [actualizarTexto,actualizarEstado]; 

    let {tarea} = peticion.body;

    if(operacion == 1 && (!tarea || tarea.trim() == "")){ 
       
        return siguiente({ error : "falta el argumento tarea en el objeto JSON" }); 
    }

    try{
        let cantidad = await operaciones[operacion - 1](peticion.params.id, operacion == 1 ? tarea : null);
        
        respuesta.json({ resultado : cantidad ? "ok" : "ko" });

    }catch(error){

        respuesta.status(500);
        respuesta.json(error);
    }
});

app.delete("/todo/borrar/:id([a-f0-9]{24})", async (peticion,respuesta) => { 
    
    try{

        let cantidad = await borrarTarea(peticion.params.id);

        return respuesta.json({resultado : cantidad ? "bien" : "mal"});

    }catch(error){
        respuesta.status(500);
        return respuesta.json(error);
    }
});

app.use((peticion,respuesta) => {
    respuesta.status(404);
    respuesta.json({error : "Not found"})
});

//
app.use((error,peticion,respuesta,siguiente) => {
    respuesta.status(400);
    respuesta.json({error : "Petición no válida"});
});

app.listen(process.env.PORT);