CREATE TABLE page_analytics.page_dimension (
  page_id INT64,                      -- Unique identifier for each page
  url STRING,                         -- URL of the page
  page_category STRING,               -- Category of the page (e.g., ProductPage, HomePage)
  page_type STRING,                   -- Type of page (e.g., landing, informational, transactional)
  visits_last_7_days INT64,           -- Total visits to this page in the last 7 days
  unique_visitors_last_7_days INT64,  -- Unique visitors to this page in the last 7 days
  trend_percentage FLOAT64            -- % change in visits from previous 7 days to last 7 days
);

CREATE TABLE page_analytics.page_navigation_dag (
  source_page_id INT64,            -- Page ID of the starting page
  destination_page_id INT64,       -- Page ID of the destination page
  transition_count INT64,          -- Total count of transitions from source to destination
  avg_time_between_pages FLOAT64,  -- Average time taken to navigate from source to destination
  last_visit_timestamp TIMESTAMP,  -- Timestamp of the most recent transition
  avg_path_depth FLOAT64           -- Average depth of this transition across sessions
);

INSERT INTO page_analytics.page_dimension (page_id, url, page_category, page_type, visits_last_7_days, unique_visitors_last_7_days, trend_percentage) VALUES
(1, 'https://4fstore.lv/viriesi/parlukot-pec-pielietojuma/sportstyle.html', 'Men', 'Listing', 300, 150, 10.5),
(2, 'https://4fstore.lv/trekinga-saite-ar-vilnas-piedevu-unisex-h4z2-opu01-90s.html', 'Product', 'ProductPage', 120, 100, -5.0),
(3, 'https://4fstore.lv/izpardosana/page-6.html', 'Sale', 'Listing', 450, 250, 20.0),
(4, 'https://4fstore.lv/viriesu-t-krekls-regular-ar-apdruku-4fs23tshm1048-20s.html', 'Men', 'ProductPage', 150, 80, 15.0),
(5, 'https://4fstore.lv/sieviesu-dunu-veste-ar-primaloft-r-black-insulation-eco-pildijumu-h4z2-bzd060-20s.html', 'Women', 'ProductPage', 200, 120, 12.0);


INSERT INTO page_analytics.page_navigation_dag (source_page_id, destination_page_id, transition_count, avg_time_between_pages, last_visit_timestamp, avg_path_depth) VALUES
(1, 2, 200, 5.5, TIMESTAMP '2023-05-01 12:00:00', 1.0),
(1, 3, 100, 4.3, TIMESTAMP '2023-05-01 13:00:00', 1.2),
(2, 4, 150, 3.8, TIMESTAMP '2023-05-01 14:00:00', 2.0),
(3, 5, 50, 6.0, TIMESTAMP '2023-05-01 15:00:00', 1.5),
(4, 5, 80, 5.0, TIMESTAMP '2023-05-01 16:00:00', 2.5);


SELECT * FROM page_analytics.page_navigation_dag

