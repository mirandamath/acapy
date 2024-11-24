// src/components/CreateSchema.js
import React, { useState } from 'react';
import axios from 'axios';
import './Components.css';
function CreateSchema({ apiUrl }) {
  const [schemaName, setSchemaName] = useState('');
  const [schemaVersion, setSchemaVersion] = useState('');
  const [attributes, setAttributes] = useState('');
  const [schemaId, setSchemaId] = useState('');
  const [credDefId, setCredDefId] = useState('');

  const createSchemaAndCredDef = async () => {
    try {
      // Converter atributos de string para array
      const attributesArray = attributes.split(',').map(attr => attr.trim());

      // Criar Schema
      const schemaResponse = await axios.post(`${apiUrl}/schemas`, {
        schema_name: schemaName,
        schema_version: schemaVersion,
        attributes: attributesArray,
      });
      setSchemaId(schemaResponse.data.schema_id);

      // Criar Definição de Credencial
      const credDefResponse = await axios.post(`${apiUrl}/credential-definitions`, {
        schema_id: schemaResponse.data.schema_id,
        support_revocation: false,
        tag: 'default',
      });
      setCredDefId(credDefResponse.data.credential_definition_id);

      alert('Schema e Definição de Credencial criados com sucesso!');
    } catch (error) {
      console.error('Erro ao criar schema ou definição de credencial:', error);
    }
  };

  return (
    <div className="create-schema">
      <h2 className="create-schema-title">Create Schema and Credential Definition</h2>
      <div className="schema-input-group">
        <label className="schema-label">Schema Name:</label>
        <input
          className="schema-input"
          type="text"
          value={schemaName}
          onChange={(e) => setSchemaName(e.target.value)}
        />
      </div>
      <div className="schema-input-group">
        <label className="schema-label">Schema Version:</label>
        <input
          className="schema-input"
          type="text"
          value={schemaVersion}
          onChange={(e) => setSchemaVersion(e.target.value)}
        />
      </div>
      <div className="schema-input-group">
        <label className="schema-label">Attributes (comma-separated):</label>
        <input
          className="schema-input"
          type="text"
          value={attributes}
          onChange={(e) => setAttributes(e.target.value)}
        />
      </div>
      <button className="create-schema-button" onClick={createSchemaAndCredDef}>
        Create
      </button>
      {schemaId && <p className="schema-id">Schema ID: {schemaId}</p>}
      {credDefId && <p className="credential-def-id">Credential Definition ID: {credDefId}</p>}
    </div>
  );
  
}

export default CreateSchema;