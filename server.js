import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Item Schema
const ItemSchema = new mongoose.Schema({
    name: String,
    price: Number
});
const Item = mongoose.model("Item", ItemSchema);

// Bill Schema
const BillSchema = new mongoose.Schema({
    items: [{ name: String, price: Number, qty: Number }],
    total: Number,
    createdAt: { type: Date, default: Date.now }
});
const Bill = mongoose.model("Bill", BillSchema);

// Routes
app.get("/api/items", async (req, res) => {
    res.json(await Item.find());
});

app.post("/api/items", async (req, res) => {
    try {
        const { name, price } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: "Name and price are required" });
        }

        const newItem = new Item({ name, price });
        const savedItem = await newItem.save();

        res.json(savedItem);
    } catch (err) {
        console.error("Error saving item:", err);
        res.status(500).json({ error: "Server error saving item" });
    }
});

app.delete("/api/items/:id", async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.json({ message: "Item deleted", deletedItem });
    } catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).json({ error: "Server error deleting item" });
    }
});

app.post("/api/bills", async (req, res) => {
    const newBill = new Bill(req.body);
    res.json(await newBill.save());
});

app.get("/api/bills", async (req, res) => {
    res.json(await Bill.find().sort({ createdAt: -1 }));
});

app.delete("/api/bills", async (req, res) => {
    try {
        await Bill.deleteMany({});
        res.json({ message: "All bills cleared" });
    } catch (err) {
        res.status(500).json({ error: "Failed to clear history" });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));