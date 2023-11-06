const express = require("express");
const cors = require("cors");
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cgpgxo2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const brandsCollection = client.db("productDB").collection("allbrands");
    const productsCollection = client.db("productDB").collection("allproducts");
    const serviceCollection = client.db("productDB").collection("myservices");

    // brandRoutes
    app.get("/brands/:brandId", async (req, res) => {
      const {brandId} = req.params;
      const cursor = await brandsCollection.find({
        _id: new ObjectId(brandId),
      });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/brands", async (req, res) => {
      const brand = req.body;
      const result = await brandsCollection.insertOne(brand);
      res.send(result);
    });

    app.get("/brands", async (req, res) => {
      const cursor = await brandsCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // update and delete routes
    app.put("/brands/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedProduct = req.body;
      console.log(updatedProduct);
      const product = {
        $set: {
          name: updatedProduct.name,
          photo: updatedProduct.photo,
          price: updatedProduct.price,
          description: updatedProduct.description,
          servicearea: updatedProduct.servicearea,
        },
      };
      const result = await brandsCollection.updateOne(filter, product, options);
      res.send(result);
    });

    app.delete("/brands/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await brandsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = {_id: new ObjectId(id)};
      // console.log(query);
      const result = await productsCollection.findOne(query);
      // const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const cursor = await productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ping: 1});
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Project CRUD Server is Running");
});

app.listen(port, () => {
  console.log(`Project CRUD server running on the PORT: ${port}`);
});
