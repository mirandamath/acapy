// src/ResidentDashboard.js
import React, { useState, useEffect } from "react";
import AcceptInvitation from "./components/AcceptInvitation";
import PendingConnections from "./components/PendingConnections";
import ViewProofRequests from "./components/ViewProofRequests";
import RespondProofRequest from "./components/RespondProofRequest";
import PendingStoreProofs from "./components/PendingStoreProofs";
import YourCredentials from "./components/YourCredentials";
import ConnectionsList from "./components/ConnectionsList";
import PendingCredentialRequests from "./components/PendingCredentialRequests";
import PendingCredentialOffers from "./components/PendingCredentialOffers";
import PendingStoreCredentials from "./components/PendingStoreCredentials";

function ResidentDashboard({ apiUrl }) {
  const [selectedProofRequest, setSelectedProofRequest] = useState(null);

  const handleSelectProofRequest = (proofRequest) => {
    console.log(proofRequest);
    setSelectedProofRequest(proofRequest);
  };

  const handleResponseSent = () => {
    setSelectedProofRequest(null);
  };

  useEffect(() => {
    // Remover ou reduzir o polling dos componentes
    // e utilizar os eventos recebidos via WebSocket
  }, []);

  return (
    <div>
      <h1>Dashboard do Agente Residente</h1>
      <AcceptInvitation apiUrl={apiUrl} />
      <PendingConnections apiUrl={apiUrl} />
      <ConnectionsList apiUrl={apiUrl} />
      {/* <ViewProofRequests apiUrl={apiUrl} onSelectProofRequest={handleSelectProofRequest} /> */}
      {/* {selectedProofRequest && (
        <RespondProofRequest
          apiUrl={apiUrl}
          selectedProofRequest={selectedProofRequest}
          onResponseSent={handleResponseSent}
        />
      )} */}
      {/* <PendingStoreProofs apiUrl={apiUrl} /> */}
      <PendingCredentialOffers apiUrl={apiUrl} />
      <PendingStoreCredentials apiUrl={apiUrl} />
      <YourCredentials apiUrl={apiUrl} />
    </div>
  );
}

export default ResidentDashboard;

// // src/DashboardResidente.js
// import React, { useState } from 'react';
// import AcceptInvitation from './components/AcceptInvitation';
// import PendingConnections from './components/PendingConnections';
// import ConnectionsList from './components/ConnectionsList';

// import PendingStoreCredentials from './components/PendingStoreCredentials';
// import PendingCredentialOffers from './components/PendingCredentialOffers';
// import YourCredentials from './components/YourCredentials';
// import PendingProofRequests from './components/PendingProofRequests';

// import RequestProof from './components/RequestProof';
// import ViewProofRequests from './components/ViewProofRequests';
// import RespondProofRequest from './components/RespondProofRequest';
// import PendingStoreProofs from './components/PendingStoreProofs';

// function DashboardResidente({ apiUrl }) {
//   const [selectedProofRequest, setSelectedProofRequest] = useState(null);

//   const handleSelectProofRequest = (proofRequest) => {
//     setSelectedProofRequest(proofRequest);
//   };

//   const handleResponseSent = () => {
//     setSelectedProofRequest(null);
//   };

//   return (
//     <div>
//       <h1>Dashboard do Agente Residente</h1>
//       <AcceptInvitation apiUrl={apiUrl} />
//       <PendingConnections apiUrl={apiUrl} />
//       <RequestProof apiUrl={apiUrl} />
//       <ViewProofRequests apiUrl={apiUrl} onSelectProofRequest={handleSelectProofRequest} />
//       {selectedProofRequest && (
//         <RespondProofRequest
//           apiUrl={apiUrl}
//           selectedProofRequest={selectedProofRequest}
//           onResponseSent={handleResponseSent}
//         />
//       )}
//       <PendingStoreCredentials apiUrl={apiUrl} />
//       <PendingStoreProofs apiUrl={apiUrl} />
//       <YourCredentials apiUrl={apiUrl} />
//     </div>
//   );
// }

// export default DashboardResidente;
