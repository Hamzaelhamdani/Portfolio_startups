import express from "express";
import multer from "multer";
import sqlite3 from "sqlite3";
import path from "path";
import cors from "cors";
import fs from "fs";

const app = express();
const port = 5000;

// Helper: Ensure directories exist
const createDirectory = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Setup directories for uploads
createDirectory("./uploads/logos/");
createDirectory("./uploads/pitch_decks/");

// Enable CORS
app.use(cors());

// Serve static files from the "uploads" directory
app.use("/uploads", express.static("uploads"));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "pitch_deck") {
            cb(null, "./uploads/pitch_decks/");
        } else if (file.fieldname === "logo") {
            cb(null, "./uploads/logos/");
        } else {
            cb(null, "./uploads/");
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Initialize SQLite database
const db = new sqlite3.Database("./startups.db", (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to the startups database.");
    }
});

// Create startups table if it does not exist
db.run(`CREATE TABLE IF NOT EXISTS startups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logo TEXT,
    name TEXT,
    pitch TEXT,
    sector TEXT,
    link TEXT,
    contact_firstname TEXT,
    contact_lastname TEXT,
    pitch_deck TEXT
)`);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Endpoint to add a startup
app.post(
    "/add-startup",
    upload.fields([{ name: "logo" }, { name: "pitch_deck" }]),
    (req, res) => {
        try {
            const { name, pitch, sector, link, contact_firstname, contact_lastname } = req.body;
            const logo = req.files?.logo?.[0]?.filename || null;
            const pitchDeck = req.files?.pitch_deck?.[0]?.filename || null;

            if (!name || !pitch || !sector) {
                return res.status(400).send("Missing required fields.");
            }

            db.run(
                `INSERT INTO startups (logo, name, pitch, sector, link, contact_firstname, contact_lastname, pitch_deck)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [logo, name, pitch, sector, link, contact_firstname, contact_lastname, pitchDeck],
                (err) => {
                    if (err) {
                        console.error("SQL Error:", err.message);
                        return res.status(500).send("Database Insertion Error.");
                    }
                    res.status(200).send("Startup successfully added!");
                }
            );
        } catch (error) {
            console.error("Server Error:", error.message);
            res.status(500).send("Unexpected Server Error.");
        }
    }
);

// Endpoint to retrieve startups
// Endpoint to fetch a single startup by ID
app.get("/startups/:id", (req, res) => {
    const { id } = req.params;

    db.get("SELECT * FROM startups WHERE id = ?", [id], (err, row) => {
        if (err) {
            console.error("Error fetching startup:", err.message);
            return res.status(500).send("Internal Server Error");
        }

        if (!row) {
            return res.status(404).send("Startup not found");
        }

        res.json(row); // Send the startup data as JSON
    });
});


// Endpoint to delete a startup
app.delete("/delete-startup/:id", (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM startups WHERE id = ?`, [id], (err) => {
        if (err) {
            console.error("SQL Error:", err.message);
            return res.status(500).send("Error deleting the startup.");
        }
        res.status(200).send("Startup deleted successfully.");
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
