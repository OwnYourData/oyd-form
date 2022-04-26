import React, { useEffect, useState } from 'react';
import { QrReader } from './QrReader';
import { JsonForms } from '@jsonforms/react';
import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';
import { Soya, SoyaForm } from 'soya-js'
import './App.css';
import { Vaultifier, VaultifierWeb } from 'vaultifier/dist/main';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

function App() {
  const [vaultifier, setVaultifier] = useState<Vaultifier>();

  const [did, setQrData] = useState<string | undefined>();
  const [form, setForm] = useState<SoyaForm | undefined>(undefined);

  const [jsonData, setJsonData] = useState<any>(undefined);
  const [formData, setFormData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [responseMessage, setResponseMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const vaultifierWeb = await VaultifierWeb.create();
      await vaultifierWeb.initialize();

      if (!vaultifierWeb.vaultifier)
        throw new Error('Vaultifier could not be initialized');

      setVaultifier(vaultifierWeb.vaultifier);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (vaultifier && did && !form) {
        setIsLoading(true);

        try {
          const { data: jsonData } = await vaultifier.get(`/api/read_qr/${did}`, true);

          const soya = new Soya();
          const soyaForm = await soya.getForm(await soya.pull(jsonData.schema_dri));

          setForm(soyaForm);
          setJsonData(jsonData);
          setFormData(jsonData.content);
        } catch { }

        setIsLoading(false);
      }
    })();
  }, [did, form, vaultifier]);

  const connect = async (action: string) => {
    if (!vaultifier || !jsonData.id)
      return;

    const { data } = await vaultifier.post('/api/connect', true, {
      action,
      id: jsonData.id,
    });

    setResponseMessage(data.message);
  }

  let content = <CircularProgress />

  if (!did)
    content = <QrReader onText={(text) => setQrData(text)} />;
  else if (responseMessage)
    content = <span>{responseMessage}</span>
  else if (form)
    content = <>
      <JsonForms
        schema={form.schema}
        uischema={form.ui}
        data={formData}
        renderers={materialRenderers}
        cells={materialCells}
        readonly={true}
      />
      <div>
        <Button variant="contained" color="primary" onClick={() => connect('send')}>Send</Button>
        <Button variant="contained" color="secondary" onClick={() => connect('cancel')}>Cancel</Button>
      </div>
    </>
  else if (formData && !form && !isLoading)
    content = <span>Could not render form</span>

  return (
    <div className="App">
      {content}
    </div>
  );
}

export default App;
