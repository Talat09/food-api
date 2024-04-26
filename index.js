const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();
//middle ware
app.use(express.json());
app.use(cors());

//mongodb connection setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eji3t2b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    await client.connect();
    const foodCollection = client.db("Alex-Kitchen").collection("foods");
    // Get all food items
    app.get("/api/foods", async (req, res) => {
      const foods = await foodCollection.find().toArray();
      res.send(foods);
    });
    // Create a new food item
    app.post("/api/food", async (req, res) => {
      const foods = req.body;
      console.log(foods);
      const result = await foodCollection.insertOne(foods);
      if (result.insertedId) {
        res.send({ success: true, message: "Food added successfully" });
      }
    });

    // Delete a food item
    app.delete("/api/foods/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await foodCollection.deleteOne(query);
      if (result.deletedCount) {
        res.send({ success: true, message: "Deleted Food Successfully" });
      }
    });

    // Update a food item
    app.put("/api/food/:id", async (req, res) => {
      const id = req.params.id;
      const { name, description, image } = req.body;
      const query = { _id: new ObjectId(id) };
      const updateOperation = { $set: { name, description, image } };
      const options = { returnOriginal: false };
      try {
        const result = await foodCollection.findOneAndUpdate(
          query,
          updateOperation,
          options
        );
        if (result.value) {
          res.send({
            success: true,
            message: "Food updated successfully",
            updatedFood: result.value,
          });
        } else {
          res
            .status(404)
            .send({ success: false, message: "Food item not found" });
        }
      } catch (error) {
        console.error("Error updating food item:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal server error" });
      }
    });
  } catch (error) {}
};
run().catch(console.dir);
// get hello world
app.get("/", (req, res) => {
  res.send("Hello World!");
});
// Start the Express server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
