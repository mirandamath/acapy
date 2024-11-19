// src/components/RespondProofRequest.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

function RespondProofRequest({ apiUrl, selectedProofRequest, onResponseSent }) {
  const [credentials, setCredentials] = useState([]);
  const [selectedCreds, setSelectedCreds] = useState([]);

  useEffect(() => {
    if (selectedProofRequest) {
      console.log('RespondProofRequest - selectedProofRequest:', selectedProofRequest);
      fetchCredentials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProofRequest]);

  const fetchCredentials = () => {
    const presExId = selectedProofRequest.pres_ex_id;
    if (!presExId) {
      console.error('presentation_exchange_id ou pres_ex_id está indefinido');
      setCredentials([]); // Garante que credentials é um array vazio
      return;
    }

    axios
      .get(`${apiUrl}/present-proof-2.0/records/${presExId}/credentials`)
      .then((response) => {
        console.log('Credenciais Recebidas:', response.data);
        setCredentials(response.data || []);
      })
      .catch((error) => {
        console.error('Erro ao buscar credenciais:', error);
        setCredentials([]); // Define como array vazio em caso de erro
      });
  };

  const handleCredentialSelection = (credId) => {
    console.log('Selecionando Credencial:', credId);
    setSelectedCreds((prev) =>
      prev.includes(credId) ? prev.filter((id) => id !== credId) : [...prev, credId]
    );
  };

  const sendPresentation = async () => {
    if (selectedCreds.length === 0) {
      alert('Por favor, selecione pelo menos uma credencial para enviar a apresentação.');
      return;
    }

    try {
      console.log('Enviando Apresentação:', selectedCreds);
      // Preparar os atributos e predicados para a apresentação
      const requestedAttributes = {};
      const requestedPredicates = {};

      const indyRequest = selectedProofRequest.by_format.pres_request.indy;

      Object.entries(indyRequest.requested_attributes).forEach(([referent, attr]) => {
        if (attr.restrictions) {
          // Seleciona a primeira credencial que corresponde às restrições
          const credId = selectedCreds[0];
          requestedAttributes[referent] = {
            cred_id: credId,
            revealed: true,
          };
        }
      });

      Object.entries(indyRequest.requested_predicates).forEach(([referent, predicate]) => {
        if (predicate.restrictions) {
          const credId = selectedCreds[0];
          requestedPredicates[referent] = {
            cred_id: credId,
          };
        }
      });

      const presExId = selectedProofRequest.pres_ex_id;
      if (!presExId) {
        alert('ID da Solicitação de Prova está indefinido.');
        return;
      }

      // Cria os dados da apresentação
      const presentationData = {
        self_attested_attributes: {},
        requested_attributes: requestedAttributes,
        requested_predicates: requestedPredicates,
      };

      // Converte os dados da apresentação para JSON e codifica em base64
      const presentationBase64 = btoa(JSON.stringify(presentationData));

      // Gera um ID único para a apresentação
      const presentationId = uuidv4();

      // Constrói o objeto de apresentação conforme esperado pela API do ACA-Py
      const presentation = {
        '@type': 'https://didcomm.org/present-proof/2.0/presentation',
        '@id': presentationId,
        'formats': [
          {
            'attach_id': 'indy',
            'format': 'hlindy/presentation@v2.0'
          }
        ],
        'presentations~attach': [
          {
            '@id': 'indy',
            'mime-type': 'application/json',
            'data': {
              'base64': presentationBase64
            }
          }
        ]
      };

      const payload = {
        presentation_request_ref: presExId,
        presentation: presentation,
      };

      console.log('Payload Enviado:', payload);

      const response = await axios.post(
        `${apiUrl}/present-proof-2.0/records/${presExId}/send-presentation`,
        payload
      );

      if (response.status === 200) {
        alert('Apresentação enviada com sucesso!');
        onResponseSent();
      } else {
        alert('Falha ao enviar a apresentação.');
      }

      console.log('Resposta da apresentação:', response.data);
    } catch (error) {
      console.error('Erro ao enviar apresentação:', error);
      alert(`Erro ao enviar apresentação: ${error.response?.data?.detail || error.message}`);
    }
  };

  if (!selectedProofRequest) {
    return null;
  }

  return (
    <div>
      <h2>Responder Solicitação de Prova</h2>
      <p>
        <strong>ID da Solicitação:</strong> {selectedProofRequest.pres_ex_id || selectedProofRequest.presentation_exchange_id}
      </p>
      <p>
        <strong>Nome da Solicitação:</strong> {selectedProofRequest.by_format?.pres_request?.indy?.name || 'N/A'}
      </p>
      <h3>Selecione as Credenciais para Enviar:</h3>
      {credentials.length > 0 ? (
        <ul>
          {credentials.map((cred) => (
            <li key={cred.cred_info.referent}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedCreds.includes(cred.cred_info.referent)}
                  onChange={() => handleCredentialSelection(cred.cred_info.referent)}
                />
                {cred.cred_info.attrs.name || 'Nome Indefinido'} - Apartment: {cred.cred_info.attrs.apartment_number || 'Número Indefinido'}
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhuma credencial correspondente encontrada.</p>
      )}
      <button onClick={sendPresentation} disabled={selectedCreds.length === 0}>
        Enviar Apresentação
      </button>
    </div>
  );
}

export default RespondProofRequest;
