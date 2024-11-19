// src/components/RequestProof.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getIssuerDID } from '../utils/getIssuerDID';

function RequestProof({ apiUrl }) {
  const [connections, setConnections] = useState([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState('');
  const [issuerDID, setIssuerDID] = useState('');

  useEffect(() => {
    // Obter o issuer DID dinamicamente
    getIssuerDID(apiUrl)
      .then((did) => {
        setIssuerDID(did);
        console.log('Issuer DID:', did); // Log para verificar
      })
      .catch((error) => {
        alert('Erro ao obter o Issuer DID. Verifique os logs.');
      });

    // Buscar conexões ativas
    axios
      .get(`${apiUrl}/connections`)
      .then((response) => {
        const activeConnections = response.data.results.filter((conn) =>
          ['active', 'completed'].includes(conn.state)
        );
        setConnections(activeConnections);
      })
      .catch((error) => {
        console.error('Erro ao buscar conexões:', error);
      });
  }, [apiUrl]);

  const sendProofRequest = async () => {
    if (!selectedConnectionId) {
      alert('Por favor, selecione uma conexão.');
      return;
    }

    if (!issuerDID) {
      alert('Issuer DID não foi carregado.');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/present-proof-2.0/send-request`, {
        connection_id: selectedConnectionId,
        presentation_request: {
          indy: {
            name: 'Proof of Residency',
            version: '1.0',
            requested_attributes: {
              'attr1_referent': {
                name: 'name',
                restrictions: [
                  {
                    issuer_did: issuerDID, // Deve ser uma string válida
                  },
                ],
              },
              'attr2_referent': {
                name: 'apartment_number',
                restrictions: [
                  {
                    issuer_did: issuerDID, // Deve ser uma string válida
                  },
                ],
              },
            },
            requested_predicates: {
              'predicate1_referent': {
                name: 'birthdate_dateint',
                p_type: '>=',
                p_value: 20030101, // Exemplo de valor de predicado
                restrictions: [
                  {
                    issuer_did: issuerDID, // Deve ser uma string válida
                  },
                ],
              },
            },
          },
        },
        comment: 'Solicitando prova de residência e verificação de idade.',
      });

      alert('Solicitação de prova enviada com sucesso!');
      console.log('Resposta da Solicitação de Prova:', response.data);
    } catch (error) {
      console.error('Erro ao enviar solicitação de prova:', error);
      alert(`Erro ao enviar solicitação de prova: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div>
      <h2>Solicitar Prova</h2>
      <div>
        <label>
          Selecionar Conexão:
          <select
            value={selectedConnectionId}
            onChange={(e) => setSelectedConnectionId(e.target.value)}
          >
            <option value="">Selecione uma conexão</option>
            {connections.map((conn) => (
              <option key={conn.connection_id} value={conn.connection_id}>
                {conn.their_label} ({conn.connection_id}) - Estado: {conn.state}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button onClick={sendProofRequest} disabled={!selectedConnectionId || !issuerDID}>
        Enviar Solicitação de Prova
      </button>
    </div>
  );
}

export default RequestProof;
