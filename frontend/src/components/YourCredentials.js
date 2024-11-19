// src/components/YourCredentials.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    <div>
      <h2>Suas Credenciais</h2>
      {credentials.length > 0 ? (
        <ul>
          {credentials.map((cred) => (
            <li key={cred.referent}>
              <p>
                <strong>ID da Credencial:</strong> {cred.referent}
              </p>
              <p>
                <strong>ID do Schema:</strong> {cred.schema_id}
              </p>
              <p>
                <strong>ID da Definição de Credencial:</strong> {cred.cred_def_id}
              </p>
              <p>
                <strong>Atributos:</strong>
              </p>
              <ul>
                {Object.entries(cred.attrs).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>Você não possui credenciais.</p>
      )}

      <h2>Suas Provas Armazenadas</h2>
      {proofs.length > 0 ? (
        <ul>
          {proofs.map((proof) => (
            <li key={proof.pres_ex_id}>
              <p>
                <strong>ID da Apresentação:</strong> {proof.pres_ex_id}
              </p>
              <p>
                <strong>Nome da Solicitação de Prova:</strong>{' '}
                {proof.by_format?.pres_request?.indy?.name || 'N/A'}
              </p>
              <p>
                <strong>Verificado:</strong> {proof.verified ? 'Sim' : 'Não'}
              </p>
              <p>
                <strong>Atributos Revelados:</strong>
              </p>
              <ul>
                {Object.entries(proof.presentation?.requested_proof?.revealed_attrs || {}).map(
                  ([key, attr]) => (
                    <li key={key}>
                      {attr.name}: {attr.value}
                    </li>
                  )
                )}
              </ul>
              <p>
                <strong>Predicados Revelados:</strong>
              </p>
              <ul>
                {Object.entries(proof.presentation?.requested_proof?.revealed_predicates || {}).map(
                  ([key, predicate]) => (
                    <li key={key}>
                      {predicate.name} {predicate.p_type} {predicate.p_value}
                    </li>
                  )
                )}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>Você não possui provas armazenadas.</p>
      )}
    </div>
  );
}

export default YourCredentials;
