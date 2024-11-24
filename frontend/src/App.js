// src/App.js
import React, { useState } from 'react';
import DashboardCondominio from './DashboardCondominio';
import DashboardResidente from './DashboardResidente';
import './App.css'
function App() {
  const [agentRole, setAgentRole] = useState('');

  const selectAgent = (role) => {
    setAgentRole(role);
  };

  if (!agentRole) {
    return (
      <div>
        <h1>Select Agent Role</h1>
        <button onClick={() => selectAgent('condominium')}>Condominium Agent</button>
        <button onClick={() => selectAgent('resident')}>Resident Agent</button>
      </div>
    );
  }

  return agentRole === 'condominium' ? (
    <DashboardCondominio apiUrl="http://localhost:8021" />
  ) : (
    <DashboardResidente apiUrl="http://localhost:8031" />
  );
}

export default App;
