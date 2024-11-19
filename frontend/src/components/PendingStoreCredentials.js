// src/components/PendingStoreCredentials.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PendingStoreCredentials({ apiUrl }) {
  const [pendingStores, setPendingStores] = useState([]);

  useEffect(() => {
    fetchPendingStores();
    const intervalId = setInterval(fetchPendingStores, 5000); // Refresh every 5 seconds
    return () => clearInterval(intervalId);
  }, [apiUrl]);

  const fetchPendingStores = () => {
    axios
      .get(`${apiUrl}/issue-credential-2.0/records?state=credential-received`)
      .then((response) => {
        setPendingStores(response.data.results);
      })
      .catch((error) => {
        console.error('Error fetching pending credential stores:', error);
      });
  };

  const storeCredential = (credExId) => {
    axios
      .post(`${apiUrl}/issue-credential-2.0/records/${credExId}/store`, {}) // Send an empty JSON body
      .then(() => {
        alert('Credential stored successfully!');
        fetchPendingStores(); // Refresh the list
      })
      .catch((error) => {
        console.error('Error storing credential:', error);
        alert(`Error storing credential: ${error.response?.data?.detail || error.message}`);
      });
  };

  return (
    <div>
      <h2>Pending Credential Stores</h2>
      {pendingStores.length > 0 ? (
        <ul>
          {pendingStores.map((store) => (
            <li key={store.cred_ex_record.cred_ex_id}>
              <p>
                <strong>Credential Exchange ID:</strong> {store.cred_ex_record.cred_ex_id}
              </p>
              <p>
                <strong>State:</strong> {store.cred_ex_record.state}
              </p>
              <button onClick={() => storeCredential(store.cred_ex_record.cred_ex_id)}>
                Store Credential
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending credential stores.</p>
      )}
    </div>
  );
}

export default PendingStoreCredentials;
