import express from "express";
import { BigQuery } from "@google-cloud/bigquery";

const app = express();
const port = 3000;

// Initialize BigQuery client
const bigquery = new BigQuery();

// Define a route to fetch data from BigQuery
app.get("/data", async (req, res) => {
  const query = `
    SELECT name, age
    FROM \`your_project.your_dataset.your_table\`
    LIMIT 10
  `;

  try {
    const [rows] = await bigquery.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error querying BigQuery:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
