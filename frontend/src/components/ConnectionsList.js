// src/components/ConnectionsList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ConnectionsList({ apiUrl }) {
  const [connections, setConnections] = useState([]);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showResponses, setShowResponses] = useState(false);




  useEffect(() => {
    fetchConnections();
    // Optionally, set up an interval to refresh the list periodically
    const intervalId = setInterval(fetchConnections, 5000); // Refresh every 5 seconds
    return () => clearInterval(intervalId);
  }, [apiUrl]);

  const fetchConnections = () => {
    axios
      .get(`${apiUrl}/connections`)
      .then((response) => {
        setConnections(response.data.results);
      })
      .catch((error) => {
        console.error('Error fetching connections:', error);
      });
  };

  const activeConnections = connections.filter(conn => conn.state === 'active');
  const invitationConnections = connections.filter(conn => conn.state === 'invitation');
  const responseConnections = connections.filter(conn => conn.state === 'response');


  return (
    <div>
      <h2>Suas Conexões</h2>

      {/* Conexões Ativas */}
      {activeConnections.length > 0 ? (
        <div>
          <h3>Conexões Ativas</h3>
          <ul>
            {activeConnections.map((conn) => (
              <li key={conn.connection_id}>
                <p>
                  <strong>ID da Conexão:</strong> {conn.connection_id}
                </p>
                <p>
                  <strong>Rótulo:</strong> {conn.their_label}
                </p>
                <p>
                  <strong>Estado:</strong> {conn.state}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Nenhuma conexão ativa encontrada.</p>
      )}

      {/* Conexões em 'invitation' */}
      <div>
        <h3 onClick={() => setShowInvitations(!showInvitations)} style={{ cursor: 'pointer' }}>
          {showInvitations ? '▼' : '►'} Convites
        </h3>
        {showInvitations && invitationConnections.length > 0 && (
          <ul>
            {invitationConnections.map((conn) => (
              <li key={conn.connection_id}>
                <p>
                  <strong>ID da Conexão:</strong> {conn.connection_id}
                </p>
                <p>
                  <strong>Rótulo:</strong> {conn.their_label}
                </p>
                <p>
                  <strong>Estado:</strong> {conn.state}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Conexões em 'response' */}
      <div>
        <h3 onClick={() => setShowResponses(!showResponses)} style={{ cursor: 'pointer' }}>
          {showResponses ? '▼' : '►'} Respostas
        </h3>
        {showResponses && responseConnections.length > 0 && (
          <ul>
            {responseConnections.map((conn) => (
              <li key={conn.connection_id}>
                <p>
                  <strong>ID da Conexão:</strong> {conn.connection_id}
                </p>
                <p>
                  <strong>Rótulo:</strong> {conn.their_label}
                </p>
                <p>
                  <strong>Estado:</strong> {conn.state}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ConnectionsList;
