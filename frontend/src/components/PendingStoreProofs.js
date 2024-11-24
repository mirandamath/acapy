// src/components/PendingStoreProofs.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Components.css';
function PendingStoreProofs({ apiUrl }) {
  const [pendingStores, setPendingStores] = useState([]);

  useEffect(() => {
    fetchPendingStores();
    const intervalId = setInterval(fetchPendingStores, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(intervalId);
  }, [apiUrl]);

  const fetchPendingStores = () => {
    axios
      .get(`${apiUrl}/present-proof-2.0/records`, {
        params: {
          state: 'done', // Estado 'done' indica que a prova foi verificada e armazenada
        },
      })
      .then((response) => {
        setPendingStores(response.data.results);
      })
      .catch((error) => {
        console.error('Erro ao buscar provas verificadas:', error);
      });
  };

  const storeProof = async (presExId) => {
    try {
      await axios.post(`${apiUrl}/present-proof-2.0/records/${presExId}/store`, {}); // Envia um corpo JSON vazio
      alert('Prova armazenada com sucesso!');
      fetchPendingStores(); // Atualiza a lista após armazenar
    } catch (error) {
      console.error('Erro ao armazenar prova:', error);
      alert(`Erro ao armazenar prova: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="pending-store-proofs">
      <h2 className="pending-store-proofs-title">Pending Store Proofs</h2>
      {pendingStores.length > 0 ? (
        <ul className="pending-store-proofs-list">
          {pendingStores.map((store) => (
            <li key={store.presentation_exchange_id} className="pending-store-proofs-item">
              <p className="proof-id">
                <strong>ID da Apresentação:</strong> {store.presentation_exchange_id}
              </p>
              <p className="proof-state">
                <strong>Estado:</strong> {store.state}
              </p>
              <button
                className="store-proof-button"
                onClick={() => storeProof(store.presentation_exchange_id)}
              >
                Armazenar Prova
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-pending-store-proofs">Nenhuma prova verificada pendente de armazenamento.</p>
      )}
    </div>
  );
  
}

export default PendingStoreProofs;
