// src/components/CreateInvitation.js
import React, { useState } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

function CreateInvitation({ apiUrl }) {
  const [invitationUrl, setInvitationUrl] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');

  const createInvitation = async () => {
    try {
      const response = await axios.post(`${apiUrl}/out-of-band/create-invitation`, {
        handshake_protocols: ['did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0'],
        use_public_did: false,
        include_handshake: true,
      });
      setInvitationUrl(response.data.invitation_url);
      setQrCodeValue(response.data.invitation_url); // Set the QR code value
    } catch (error) {
      console.error('Error creating invitation:', error);
    }
  };

  return (
    <div>
      <h2>Create Connection Invitation</h2>
      <button onClick={createInvitation}>Create Invitation</button>
      {invitationUrl && (
        <div>
          <p>Invitation URL:</p>
          <textarea readOnly value={invitationUrl} rows={4} cols={50} />
          <button
            onClick={() => {
              navigator.clipboard.writeText(invitationUrl);
              alert('Invitation URL copied to clipboard!');
            }}
          >
            Copy to Clipboard
          </button>
          <div style={{ marginTop: '20px' }}>
            <p>Or scan the QR code:</p>
            <QRCodeCanvas value={qrCodeValue} size={256} />
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateInvitation;
