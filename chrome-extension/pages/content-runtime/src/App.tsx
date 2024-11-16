import React, { useEffect, useState } from 'react';
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

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
      <h1 style={styles.header}>Page Data</h1>
      {apiData ? (
        <div style={styles.content}>
          <div style={styles.infoSection}>
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
          </div>

          <h2 style={styles.subHeader}>Navigation Stats</h2>
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

          <h2 style={styles.subHeader}>Transition Count Chart</h2>
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

          <h2 style={styles.subHeader}>Visits Trend on Last 7 days</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dummyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="last_visit_date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="no_of_visitors" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p style={styles.loading}>Loading...</p>
      )}
    </div>
  );
};


const dummyData = Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - index)); // Start from 7 days ago and end today
  return {
    last_visit_date: date.toLocaleDateString(),
    no_of_visitors: Math.floor(Math.random() * 100) + 50, // Random time between 50 and 150 seconds
  };
});

const styles = {
  sidebar: {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    width: '33vw',
    height: '100vh',
    background: 'linear-gradient(to bottom, #f5f5f5, #e0e0e0)',
    padding: '16px',
    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
    overflowY: 'auto' as const,
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    fontSize: '24px',
    marginBottom: '16px',
    color: '#333',
    background: 'linear-gradient(to right, #ff7e5f, #feb47b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subHeader: {
    fontSize: '20px',
    marginTop: '24px',
    marginBottom: '12px',
    color: '#555',
    background: 'linear-gradient(to right, #6a11cb, #2575fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  content: {
    padding: '8px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  infoSection: {
    marginBottom: '16px',
  },
  navigationStat: {
    marginBottom: '16px',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #f9f9f9, #e0e0e0)',
  },
  loading: {
    fontSize: '18px',
    color: '#888',
  },
};
export default App;
