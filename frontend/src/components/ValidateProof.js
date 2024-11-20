// src/components/ValidateProof.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ValidateProof({ apiUrl }) {
  const [proofs, setProofs] = useState([]);
  const [selectedProofId, setSelectedProofId] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Buscar todas as solicitações de prova com estado 'presentation-received'
    const fetchProofs = async () => {
      try {
        const response = await axios.get(`${apiUrl}/present-proof-2.0/records`);
        const receivedProofs = response.data.results.filter(
          (proof) => proof.state === 'presentation-received'
        );
        setProofs(receivedProofs);
      } catch (err) {
        console.error('Erro ao buscar solicitações de prova:', err);
        setError('Falha ao buscar solicitações de prova.');
      }
    };

    fetchProofs();
  }, [apiUrl]);

  const validateProof = async () => {
    if (!selectedProofId) {
      alert('Por favor, selecione uma solicitação de prova.');
      return;
    }

    setLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const response = await axios.post(
        `${apiUrl}/present-proof-2.0/records/${selectedProofId}/verify-presentation`
      );
      setValidationResult(response.data);
      alert('Prova validada com sucesso!');
    } catch (err) {
      console.error('Erro ao validar prova:', err);
      setError(err.response?.data?.detail || 'Falha na validação da prova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Validar Prova</h2>
      {error && (
        <div style={{ color: 'red' }}>
          <p>{error}</p>
        </div>
      )}
      <div>
        <label>
          Selecionar Solicitação de Prova:
          
          <select
            value={selectedProofId}
            onChange={(e) => setSelectedProofId(e.target.value)}
          >
            {console.log(selectedProofId)}
            <option value="">Selecione uma solicitação</option>
            {proofs.map((proof) => (
              <option key={proof.pres_ex_id} value={proof.pres_ex_id}>
                {proof.pres_ex_id} - {proof.name || 'Sem Nome'}
              </option>    
            ))}
          </select>
        </label>
      </div>
      <button onClick={validateProof} disabled={!selectedProofId || loading}>
        {loading ? 'Validando...' : 'Validar Prova'}
      </button>

      {validationResult && (
        <div>
          <h3>Resultado da Validação:</h3>
          <pre>{JSON.stringify(validationResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ValidateProof;