
import { ArrowDownOutlined, ArrowUpOutlined, ReloadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { NavigationGraph } from './NavigationGraph';
import { LineChart, Line, Legend } from 'recharts';

interface NavigationStat {
  destination_page_id: number;
  transition_count: number;
  avg_time_between_pages: number;
  last_visit_timestamp: { value: string };
  destination_url: string;
  destination_category: string;
}

interface VisitStat {
  visit_date: string;
  total_visits: number;
}
interface ApiResponse {
  page_id: number;
  url: string;
  visits_last_7_days: number;
  unique_visitors_last_7_days: number;
  trend_percentage: number;
  navigation_stats: NavigationStat[];
  visit_stats: VisitStat[];
}
interface AppProps {
  onClose: () => void;
}
interface AppProps {
  onClose: () => void;
}

const App: React.FC<AppProps> = props => {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);

  const matchingLinks = React.useRef<HTMLElement[]>([]); // Track matching links
  useEffect(() => {
    // Cleanup function to reset styles and remove labels
    const cleanupMatchedLinks = () => {
      matchingLinks.current.forEach(link => {
        link.style.backgroundColor = ''; // Reset background color
        const label = link.querySelector('.transition-label');
        if (label) {
          label.remove(); // Remove the label
        }
      });
      matchingLinks.current = []; // Clear the list
    };

    // Perform cleanup before the effect runs again or component unmounts
    return cleanupMatchedLinks;
  }, []); // Empty dependency array ensures cleanup happens on unmount


  const fetchData = () => {
    setLoading(true);
    fetch(`http://localhost:3000/page_data?url=${encodeURIComponent(window.location.href)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: ApiResponse) => {

        setApiData({
          ...data,
          navigation_stats: data.navigation_stats.filter(stat => stat.destination_url !== null),
        });

        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.error('Error fetching data:', error);
      });
  };
  useEffect(() => {
    if (hoveredUrl) {
      const element = document.querySelector(`[data-url="${hoveredUrl}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight');
      }
    }

    return () => {
      if (hoveredUrl) {
        const element = document.querySelector(`[data-url="${hoveredUrl}"]`);
        if (element) {
          element.classList.remove('highlight');
        }
      }
    };
  }, [hoveredUrl]);

  useEffect(() => {
    // Cleanup previous styles and labels
    const cleanupMatchedLinks = () => {
      matchingLinks.current.forEach(link => {
        link.style.backgroundColor = ''; // Reset background color
        const label = link.querySelector('.transition-label');
        if (label) {
          label.remove(); // Remove the label
        }
      });
      matchingLinks.current = []; // Clear the list
    };

    cleanupMatchedLinks(); // Cleanup before applying new styles

    if (apiData) {
      // Iterate through each destination_url
      apiData.navigation_stats.forEach(stat => {
        const destinationUrlPath = stat.destination_url;

        // Skip null URLs
        if (!destinationUrlPath) return;

        // Skip if the path is "/"
        if (destinationUrlPath === '/') return;

        // Find all DOM nodes containing links to the destination URL
        const links = document.querySelectorAll(`[href*="${destinationUrlPath}"]`);

        links.forEach(link => {
          const element = link as HTMLElement;

          // Highlight the matching element with a mild red fill
          element.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
          element.style.position = 'relative'; // Ensure the element can contain the label

          // Add a label showing the transition count
          const label = document.createElement('div');
          label.className = 'transition-label'; // Add a class for easy cleanup
          label.textContent = `${stat.transition_count}`;
          label.style.position = 'absolute';
          label.style.top = '-10px';
          label.style.left = '50%';
          label.style.transform = 'translateX(-50%)';
          label.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
          label.style.color = 'white';
          label.style.padding = '2px 2px';
          label.style.borderRadius = '4px';
          label.style.fontSize = '10px'; // Smaller font size
          label.style.fontWeight = '200'; // Lighter font weight
          label.style.pointerEvents = 'none'; // Prevent interaction with the label
          label.style.overflow = 'visible';
          // label.style.width = '100%';

          // Append the label to the element
          element.appendChild(label);

          // Track this element for cleanup
          matchingLinks.current.push(element);
        });
      });
    }
  }, [apiData]);
  useEffect(() => {
    let lastUrl = window.location.href;

    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        fetchData();
      }
    });

    observer.observe(document, { subtree: true, childList: true });

    return () => {
      observer.disconnect();
    };
  }, []);


    const observer = new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        fetchData();
      }
    });

    observer.observe(document, { subtree: true, childList: true });

    return () => {
      observer.disconnect();
    };
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

      <button
        onClick={fetchData}
        style={{
          ...styles.reloadButton,
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '5px',
          border: 'none',
          background: 'transparent',
        }}>
        <ReloadOutlined style={{ fontSize: '20px', color: '#007bff' }} />
      </button>
      <button
        onClick={props.onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '50px',
          padding: '5px',
          border: 'none',
          background: 'transparent',
          fontSize: '20px',
          cursor: 'pointer',
        }}>
        &times;
      </button>

      <h1>Page Data</h1>
      {loading ? (
        <p> Loading ... </p>
      ) : apiData ? (

        <div>
          <p>
            <strong>Page ID:</strong> {apiData.page_id}
          </p>
          <p>
            <strong>URL:</strong>{' '}
            <a href={apiData.url} rel="noopener noreferrer">
              {apiData.url}
            </a>
          </p>
          <p>
            <strong>Visits Last 7 Days:</strong> {apiData.visits_last_7_days}{' '}
            {apiData.trend_percentage > 0 ? (
              <span style={{ color: 'green' }}>
                <ArrowUpOutlined /> ({apiData.trend_percentage.toFixed(2)}%)
              </span>
            ) : (
              <span style={{ color: 'red' }}>
                <ArrowDownOutlined /> ({apiData.trend_percentage.toFixed(2)}%)
              </span>
            )}
          </p>
          <p>
            <strong>Unique Visitors Last 7 Days:</strong> {apiData.unique_visitors_last_7_days}
          </p>
          <NavigationGraph stats={apiData.navigation_stats} />

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
          <br />
          <h2>Visit Stats Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={apiData?.visit_stats.map(stat => ({
                visit_date: new Date(stat.visit_date).toLocaleDateString(),
                total_visits: stat.total_visits,
              }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="visit_date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total_visits" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>

          <h2>Navigation Stat Details</h2>

          {apiData.navigation_stats.map(stat => (
            <div key={stat.destination_page_id} style={styles.navigationStat} data-url={stat.destination_url}>
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
                <a
                  href={stat.destination_url}
                  onMouseEnter={() => setHoveredUrl(stat.destination_url)}
                  onMouseLeave={() => setHoveredUrl(null)}
                  rel="noopener noreferrer">
                  {stat.destination_url}
                </a>
              </p>
              <p>
                <strong>Category:</strong> {stat.destination_category}
              </p>
            </div>
          ))}

          <br />
          <br />
        </div>
      ) : (
        <p>No Data...</p>
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
    marginBottom: '48px',

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
  reloadButton: {
    marginBottom: '16px',
    padding: '8px 16px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  reloadButton: {
    marginBottom: '16px',
    padding: '8px 16px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};
export default App;
