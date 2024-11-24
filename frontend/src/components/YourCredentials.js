// src/components/YourCredentials.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Components.css';
function YourCredentials({ apiUrl }) {
  const [credentials, setCredentials] = useState([]);
  const [proofs, setProofs] = useState([]);

  useEffect(() => {
    fetchCredentials();
    fetchProofs();
    const intervalId = setInterval(() => {
      fetchCredentials();
      fetchProofs();
    }, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(intervalId);
  }, [apiUrl]);

  const fetchCredentials = () => {
    axios
      .get(`${apiUrl}/credentials`)
      .then((response) => {
        setCredentials(response.data.results);
      })
      .catch((error) => {
        console.error('Erro ao buscar credenciais:', error);
      });
  };

  const fetchProofs = () => {
    axios
      .get(`${apiUrl}/present-proof-2.0/records`, {
        params: {
          state: 'done', // Estado 'done' indica que a prova foi verificada e armazenada
        },
      })
      .then((response) => {
        setProofs(response.data.results);
      })
      .catch((error) => {
        console.error('Erro ao buscar provas:', error);
      });
  };

  return (
    <div className="your-credentials">
      <h2 className="your-credentials-title">Suas Credenciais</h2>
      {credentials.length > 0 ? (
        <ul className="credentials-list">
          {credentials.map((cred) => (
            <li key={cred.referent} className="credential-item">
              <p className="credential-id">
                <strong>ID da Credencial:</strong> {cred.referent}
              </p>
              <p className="schema-id">
                <strong>ID do Schema:</strong> {cred.schema_id}
              </p>
              <p className="cred-def-id">
                <strong>ID da Definição de Credencial:</strong> {cred.cred_def_id}
              </p>
              <p className="attributes-title">
                <strong>Atributos:</strong>
              </p>
              <ul className="attributes-list">
                {Object.entries(cred.attrs).map(([key, value]) => (
                  <li key={key} className="attribute-item">
                    {key}: {value}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-credentials">Você não possui credenciais.</p>
      )}
  
      <h2 className="stored-proofs-title">Suas Provas Armazenadas</h2>
      {proofs.length > 0 ? (
        <ul className="stored-proofs-list">
          {proofs.map((proof) => (
            <li key={proof.pres_ex_id} className="stored-proof-item">
              <p className="proof-id">
                <strong>ID da Apresentação:</strong> {proof.pres_ex_id}
              </p>
              <p className="proof-name">
                <strong>Nome da Solicitação de Prova:</strong>{' '}
                {proof.by_format?.pres_request?.indy?.name || 'N/A'}
              </p>
              <p className="proof-verified">
                <strong>Verificado:</strong> {proof.verified ? 'Sim' : 'Não'}
              </p>
              <p className="revealed-attributes-title">
                <strong>Atributos Revelados:</strong>
              </p>
              <ul className="revealed-attributes-list">
                {Object.entries(proof.presentation?.requested_proof?.revealed_attrs || {}).map(
                  ([key, attr]) => (
                    <li key={key} className="revealed-attribute-item">
                      {attr.name}: {attr.value}
                    </li>
                  )
                )}
              </ul>
              <p className="revealed-predicates-title">
                <strong>Predicados Revelados:</strong>
              </p>
              <ul className="revealed-predicates-list">
                {Object.entries(proof.presentation?.requested_proof?.revealed_predicates || {}).map(
                  ([key, predicate]) => (
                    <li key={key} className="revealed-predicate-item">
                      {predicate.name} {predicate.p_type} {predicate.p_value}
                    </li>
                  )
                )}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-stored-proofs">Você não possui provas armazenadas.</p>
      )}
    </div>
  );
  
}

export default YourCredentials;
