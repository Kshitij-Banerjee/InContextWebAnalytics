import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css'; // Ensure this file contains the necessary styles

const Sidebar: React.FC = () => {
  return (
    <div className="fixed right-0 top-0 z-50 h-full w-64 overflow-y-auto border-l border-gray-300 bg-gray-100 p-4 shadow-lg">
      <h2>Page Analytics</h2>
      <div id="analytics-content">{/* Analytics data will be populated here */}</div>
    </div>
  );
};

// Inject the sidebar into the page
const sidebarContainer = document.createElement('div');
document.body.appendChild(sidebarContainer);

// Use createRoot for React 18 compatibility
const root = createRoot(sidebarContainer);
root.render(<Sidebar />);
