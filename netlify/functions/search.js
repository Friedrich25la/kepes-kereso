// Netlify Function — Local JSON Search (no AWS required)
// Reads products_with_status_min.json bundled with the build

const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  const q = (event.queryStringParameters?.q || "").trim().toLowerCase();

  if (!q || q.length < 3) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Minimum 3 characters required." }),
    };
  }

  try {
    // Locate the JSON file relative to the function folder
    const filePath = path.join(__dirname, "../../products_with_status_min.json");

    // Read and parse JSON
    const jsonText = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(jsonText);

    // Simple text search (case-insensitive, match in name or sku)
    const results = data.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const sku = (item.sku || "").toLowerCase();
      return name.includes(q) || sku.includes(q);
    });

    // Limit results
    const limited = results.slice(0, 50);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        count: limited.length,
        results: limited,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
