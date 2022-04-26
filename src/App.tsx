import React, { useEffect, useState } from 'react';
import { QrReader } from './QrReader';
import { JsonForms } from '@jsonforms/react';
import {
  materialRenderers,
  materialCells,
} from '@jsonforms/material-renderers';
import { Soya, SoyaForm } from 'soya-js'
import './App.css';
import { VaultifierWeb } from 'vaultifier/dist/main';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

function App() {
  const [did, setQrData] = useState<string | undefined>();
  const [form, setForm] = useState<SoyaForm | undefined>(undefined);
  const [data, setData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (did && !form) {
        setIsLoading(true);

        try {
          const vaultifierWeb = await VaultifierWeb.create();
          await vaultifierWeb.initialize();

          if (!vaultifierWeb.vaultifier)
            throw new Error('Vaultifier could not be initialized');

          const { vaultifier } = vaultifierWeb;
          const { data: jsonData } = await vaultifier.get(`/api/read_qr/${did}`, true);

          const soya = new Soya();
          const soyaForm = await soya.getForm(await soya.pull(jsonData.schema_dri));

          setForm(soyaForm);
          setData(jsonData.content);
        } catch { }

        setIsLoading(false);
      }
    })();
  }, [did, form]);

  let content = <CircularProgress />

  if (!did)
    content = <QrReader onText={(text) => setQrData(text)} />;
  else if (form)
    content = <>
      <JsonForms
        schema={form.schema}
        uischema={form.ui}
        data={data}
        renderers={materialRenderers}
        cells={materialCells}
        onChange={({ data }) => setData(data)}
      />
      <div>
        <Button variant="contained" color="primary">Send</Button>
        <Button variant="contained" color="secondary">Cancel</Button>
      </div>
    </>
  else if (data && !form && !isLoading)
    content = <span>Could not render form</span>

  return (
    <div className="App">
      {content}
    </div>
  );
}

export default App;
