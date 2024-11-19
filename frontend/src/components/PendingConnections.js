// src/components/PendingConnections.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PendingConnections({ apiUrl }) {
  const [pendingConnections, setPendingConnections] = useState([]);

  useEffect(() => {
    fetchPendingConnections();
    const intervalId = setInterval(fetchPendingConnections, 5000); // Refresh every 5 seconds
    return () => clearInterval(intervalId);
  }, [apiUrl]);

  const fetchPendingConnections = () => {
    axios
      .get(`${apiUrl}/connections?state=request`)
      .then((response) => {
        setPendingConnections(response.data.results);
      })
      .catch((error) => {
        console.error('Error fetching pending connections:', error);
      });
  };

  const acceptConnection = (connectionId) => {
    axios
      .post(`${apiUrl}/didexchange/${connectionId}/accept-request`)
      .then(() => {
        alert('Connection accepted successfully!');
        fetchPendingConnections(); // Refresh the list
      })
      .catch((error) => {
        console.error('Error accepting connection:', error);
      });
  };

  return (
    <div>
      <h2>Pending Connections</h2>
      {pendingConnections.length > 0 ? (
        <ul>
          {pendingConnections.map((conn) => (
            <li key={conn.connection_id}>
              <p>
                <strong>Connection ID:</strong> {conn.connection_id}
              </p>
              <p>
                <strong>Their Label:</strong> {conn.their_label}
              </p>
              <p>
                <strong>State:</strong> {conn.state}
              </p>
              <button onClick={() => acceptConnection(conn.connection_id)}>
                Accept Connection
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending connections.</p>
      )}
    </div>
  );
}

export default PendingConnections;
