// src/components/ViewProofRequests.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewProofRequests({ apiUrl, onSelectProofRequest }) {
  const [proofRequests, setProofRequests] = useState([]);

  useEffect(() => {
    fetchProofRequests();
    const intervalId = setInterval(fetchProofRequests, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(intervalId);
  }, [apiUrl]);

  const fetchProofRequests = () => {
    // Busca solicitações de prova nos estados 'proposal-received' e 'request-received'
    axios
      .get(`${apiUrl}/present-proof-2.0/records`, {
        params: {
          state: ['proposal-received', 'request-received'],
        },
      })
      .then((response) => {
        // console.log('Solicitações de Prova Recebidas:', response.data.results); // Adicionado
        setProofRequests(response.data.results);
      })
      .catch((error) => {
        console.error('Erro ao buscar solicitações de prova:', error);
      });
  };

  return (
    <div>
      <h2>Solicitações de Prova</h2>
      {Array.isArray(proofRequests) && proofRequests.length > 0 ? (
        <ul>
          {proofRequests.map((request) => (
            <li key={request.pres_ex_id}>
              <p>
                <strong>ID da Solicitação:</strong> {request.pres_ex_id}
              </p>
              <p>
                <strong>Nome da Solicitação:</strong>{' '}
                {request.by_format?.pres_request?.indy?.name || 'N/A'}
              </p>
              <p>
                <strong>Estado:</strong> {request.state}
              </p>
              <button onClick={() => onSelectProofRequest(request)}>
                Responder Solicitação
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma solicitação de prova pendente.</p>
      )}
    </div>
  );
}

export default ViewProofRequests;
