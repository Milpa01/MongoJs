const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 3000;
const url = "mongodb://localhost:27017";
const dbName = "Concesionaria";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

let db;
MongoClient.connect(url).then(client => {
    db = client.db(dbName);
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
}).catch(console.error);

// Mostrar lista de vehículos
app.get("/", async (req, res) => {
    const autos = await db.collection("Automoviles").find().toArray();
    res.render("index", { autos });
});

// Formulario para agregar vehículo
app.get("/agregar", (req, res) => {
    res.render("agregar");
});

app.post("/agregar", async (req, res) => {
    const { placa, marca, modelo, tipo, cilindros } = req.body;
    const existente = await db.collection("Automoviles").findOne({ Placa: placa });
    if (existente) {
        return res.send("Ya existe un vehículo con esa placa.");
    }
    await db.collection("Automoviles").insertOne({
        Placa: placa,
        Marca: marca,
        Modelo: modelo,
        Tipo: tipo,
        Cilindros: parseInt(cilindros)
    });
    res.redirect("/");
});

// Formulario para editar
app.get("/editar/:id", async (req, res) => {
    const auto = await db.collection("Automoviles").findOne({ _id: new ObjectId(req.params.id) });
    res.render("editar", { auto });
});

app.post("/editar/:id", async (req, res) => {
    const { modelo } = req.body;
    await db.collection("Automoviles").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { Modelo: modelo } }
    );
    res.redirect("/");
});

// Eliminar vehículo
app.post("/eliminar/:id", async (req, res) => {
    await db.collection("Automoviles").deleteOne({ _id: new ObjectId(req.params.id) });
    res.redirect("/");
});
