// src/components/ViewCredentials.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewCredentials({ apiUrl }) {
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    axios
      .get(`${apiUrl}/credentials`)
      .then((response) => {
        setCredentials(response.data.results);
      })
      .catch((error) => {
        console.error('Error fetching credentials:', error);
      });
  }, [apiUrl]);

  return (
    <div>
      <h2>Your Credentials</h2>
      {credentials.length > 0 ? (
        <ul>
          {credentials.map((cred) => (
            <li key={cred.referent}>
              <p>
                <strong>Credential ID:</strong> {cred.referent}
              </p>
              <p>
                <strong>Attributes:</strong>{' '}
                {JSON.stringify(cred.attrs, null, 2)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No credentials found.</p>
      )}
    </div>
  );
}

export default ViewCredentials;
