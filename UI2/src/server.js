import express from "express";
// import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();

// Enable CORS
// app.use(cors());

// File paths
const FILES_DIRECTORY = "/Users/shashankshivakumar/Documents/GitHub/rasa_bot-main/app/actions/form_feilds_mapping_v2";
const FORMS_JSON_PATH = "/Users/shashankshivakumar/Documents/GitHub/rasa_bot-main/app/actions/form_filling_code/forms_subset.json";

// API to fetch files and forms
app.get("/api/forms", (req, res) => {
    try {
        // Load files and forms
        const files = fs.readdirSync(FILES_DIRECTORY).map(file => path.basename(file, ".json"));
        const forms = JSON.parse(fs.readFileSync(FORMS_JSON_PATH, "utf-8"));

        // Respond with files and forms
        res.json({ files, forms });
    } catch (error) {
        console.error("Error fetching forms or files:", error);
        res.status(500).json({ error: "Unable to load forms or files." });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
