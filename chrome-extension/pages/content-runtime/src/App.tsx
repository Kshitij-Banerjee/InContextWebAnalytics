import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface NavigationStat {
  destination_page_id: number;
  transition_count: number;
  avg_time_between_pages: number;
  last_visit_timestamp: { value: string };
  destination_url: string;
  destination_category: string;
}

interface ApiResponse {
  page_id: number;
  url: string;
  visits_last_7_days: number;
  unique_visitors_last_7_days: number;
  trend_percentage: number;
  navigation_stats: NavigationStat[];
}

const App: React.FC = () => {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/page_data?url=${encodeURIComponent(window.location.href)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: ApiResponse) => setApiData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  // Helper function to extract the URL path without the domain
  const getPathFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch (error) {
      return url; // fallback to full URL if parsing fails
    }
  };

  return (
    <div style={styles.sidebar}>
      <h1>Page Data</h1>
      {apiData ? (
        <div>
          <p>
            <strong>Page ID:</strong> {apiData.page_id}
          </p>
          <p>
            <strong>URL:</strong>{' '}
            <a href={apiData.url} target="_blank" rel="noopener noreferrer">
              {apiData.url}
            </a>
          </p>
          <p>
            <strong>Visits Last 7 Days:</strong> {apiData.visits_last_7_days}
          </p>
          <p>
            <strong>Unique Visitors Last 7 Days:</strong> {apiData.unique_visitors_last_7_days}
          </p>
          <p>
            <strong>Trend Percentage:</strong> {apiData.trend_percentage}%
          </p>

          <h2>Navigation Stats</h2>
          {apiData.navigation_stats.map(stat => (
            <div key={stat.destination_page_id} style={styles.navigationStat}>
              <p>
                <strong>Destination Page ID:</strong> {stat.destination_page_id}
              </p>
              <p>
                <strong>Transition Count:</strong> {stat.transition_count}
              </p>
              <p>
                <strong>Average Time Between Pages:</strong> {stat.avg_time_between_pages} seconds
              </p>
              <p>
                <strong>Last Visit:</strong> {new Date(stat.last_visit_timestamp.value).toLocaleString()}
              </p>
              <p>
                <strong>Destination URL:</strong>{' '}
                <a href={stat.destination_url} target="_blank" rel="noopener noreferrer">
                  {stat.destination_url}
                </a>
              </p>
              <p>
                <strong>Category:</strong> {stat.destination_category}
              </p>
            </div>
          ))}

          <h2>Transition Count Chart</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={apiData.navigation_stats.map(stat => ({
                ...stat,
                destination_path: getPathFromUrl(stat.destination_url),
              }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="destination_path" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transition_count" fill="#8884d8">
                {apiData.navigation_stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.transition_count > 150 ? '#82ca9d' : '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

const styles = {
  sidebar: {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    width: '33vw',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '16px',
    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
    overflowY: 'auto' as const,
    marginBottom: '16px', // Added margin bottom
  },
  navigationStat: {
    marginBottom: '16px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
  },
};

export default App;
