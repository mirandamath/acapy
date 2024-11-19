// src/DashboardCondominio.js
import React, { useEffect } from "react";
import CreateInvitation from "./components/CreateInvitation";
import CreateSchema from "./components/CreateSchema";
import IssueCredential from "./components/IssueCredential";
import RequestProof from "./components/RequestProof";
import PendingConnections from "./components/PendingConnections";
import PendingCredentialRequests from "./components/PendingCredentialRequests";
import ConnectionsList from "./components/ConnectionsList";

function DashboardCondominio({ apiUrl }) {
  // console.log(apiUrl)

  useEffect(() => {
    // Remover ou reduzir o polling dos componentes
    // e utilizar os eventos recebidos via WebSocket
  }, []);

  return (
    <div>
      <h1>Agente - Condomínio</h1>
      <CreateInvitation apiUrl={apiUrl} />
      <ConnectionsList apiUrl={apiUrl} />
      <PendingConnections apiUrl={apiUrl} />
      <CreateSchema apiUrl={apiUrl} />
      <IssueCredential apiUrl={apiUrl} />
      <PendingCredentialRequests apiUrl={apiUrl} />
      {/* <RequestProof apiUrl={apiUrl} /> */}
    </div>
  );
}

export default DashboardCondominio;
