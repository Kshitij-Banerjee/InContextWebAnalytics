import express, { Request, Response, NextFunction } from "express";
import { BigQuery } from "@google-cloud/bigquery";
import cors from "cors";

const app = express();
const bigquery = new BigQuery();
const PORT = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());
// Warm-up function to test BigQuery connection on boot
async function warmUpBigQuery() {
  try {
    console.log("Warming up BigQuery connection...");
    // Run a lightweight query to warm up the connection
    const query = "SELECT 1";
    await bigquery.query({
      query,
      jobTimeoutMs: 30000, // Set timeout to 30 seconds
    });
    console.log("BigQuery warm-up successful.");
  } catch (error) {
    console.error("BigQuery warm-up failed:", error);
  }
}

// Call the warm-up function on server boot
warmUpBigQuery();

app.get(
  "/page_data",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url } = req.query as { url: string };

      // Step 1: Find the page_id for the given URL without type structure in params
      const pageIdQuery = `
      SELECT page_id
      FROM page_analytics.page_nodes
      WHERE url = @url
			ORDER BY page_id asc
      LIMIT 1;
    `;
      const [pageIdResult] = await bigquery.query({
        query: pageIdQuery,
        params: { url }, // Pass 'url' directly as a string
      });
      const pageIdRow = pageIdResult[0];

      if (!pageIdRow) {
        return res.status(404).json({ error: "Page not found" });
      }
      const pageId = pageIdRow.page_id;

      // Step 2: Retrieve page-specific data from page_dimension
      const pageDataQuery = `
      SELECT 
        visits_last_7_days,
        unique_visitors_last_7_days,
        trend_percentage
      FROM page_analytics.page_nodes
      WHERE page_id = @pageId;
    `;
      const [pageDataResult] = await bigquery.query({
        query: pageDataQuery,
        params: { pageId }, // Pass 'pageId' directly
      });
      const pageData = pageDataResult[0];

      // Step 3: Retrieve navigation stats from page_navigation_dag for transitions from this page
      const navigationStatsQuery = `
      SELECT 
        destination_page_id,
        transition_count,
        avg_time_between_pages,
        last_visit_timestamp
      FROM page_analytics.page_node_transitions
      WHERE source_page_id = @pageId
      ORDER BY transition_count DESC
      LIMIT 5;
    `;
      const [navigationStatsResult] = await bigquery.query({
        query: navigationStatsQuery,
        params: { pageId },
      });

      // Step 4: Retrieve URLs and categories for each destination_page_id
      const destinationPageIds = navigationStatsResult.map(
        (row) => row.destination_page_id
      );
      const destinationPagesQuery = `
      SELECT page_id, url, page_category
      FROM page_analytics.page_nodes
      WHERE page_id IN UNNEST(@destinationPageIds);
    `;
      const [destinationPagesResult] = await bigquery.query({
        query: destinationPagesQuery,
        params: {
          destinationPageIds,
        },
      });

      // Step 5: Map destination page details to navigation stats
      const destinationPageMap = destinationPagesResult.reduce((map, page) => {
        map[page.page_id] = {
          url: page.url,
          page_category: page.page_category,
        };
        return map;
      }, {} as Record<number, { url: string; page_category: string }>);

      const enrichedNavigationStats = navigationStatsResult.map((row) => ({
        destination_page_id: row.destination_page_id,
        transition_count: row.transition_count,
        avg_time_between_pages: row.avg_time_between_pages,
        last_visit_timestamp: row.last_visit_timestamp,
        destination_url:
          destinationPageMap[row.destination_page_id]?.url || null,
        destination_category:
          destinationPageMap[row.destination_page_id]?.page_category || null,
      }));

      // Step 6: Return the page data and enriched navigation stats
      return res.json({
        page_id: pageId,
        url,
        visits_last_7_days: pageData.visits_last_7_days,
        unique_visitors_last_7_days: pageData.unique_visitors_last_7_days,
        trend_percentage: pageData.trend_percentage,
        navigation_stats: enrichedNavigationStats,
      });
    } catch (error) {
      console.error("Error retrieving page data:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
