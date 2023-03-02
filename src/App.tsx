import React, { useEffect, useState } from 'react';
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
import TextField from '@material-ui/core/TextField';

function App() {
  const [vaultifier, setVaultifier] = useState<Vaultifier>();

  const [schemaDri, setSchemaDri] = useState<string | undefined>();
  const [tag, setTag] = useState<string | undefined>();
  const [language, setLanguage] = useState<string | undefined>();

  const [form, setForm] = useState<SoyaForm | undefined>(undefined);

  const [isLoading, setIsLoading] = useState<boolean>(false);


  useEffect(() => {
    (async () => {
      const vaultifierWeb = await VaultifierWeb.create();
      await vaultifierWeb.initialize();

      if (!vaultifierWeb.vaultifier)
        throw new Error('Vaultifier could not be initialized');

      setVaultifier(vaultifierWeb.vaultifier);
    })();
  }, []);

  const fetchForm = async () => {
    if (vaultifier && schemaDri) {
      setIsLoading(true);

      try {
        const soya = new Soya();
        const soyaForm = await soya.getForm(await soya.pull(schemaDri), {
          language,
          tag,
        });

        setForm(soyaForm);
      } catch { }

      setIsLoading(false);
    }
  }

  let content: JSX.Element;
  if (isLoading)
    content = <CircularProgress />;
  else
    content = <>
      <TextField
        label="SOyA Schema DRI"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setSchemaDri(event.target.value);
        }}
        value={schemaDri}
      />
      <TextField
        label="Tag"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setTag(event.target.value);
        }}
        value={tag}
      />
      <TextField
        label="Language"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setLanguage(event.target.value);
        }}
        value={language}
      />
      <Button className="Button" variant="contained" color="primary" onClick={() => fetchForm()}>Load Form</Button>
    </>;

  return (
    <div className="App">
      <h1>OwnYourData SOyA-Forms</h1>
      {content}
      {
        form ?
          <JsonForms
            schema={form.schema}
            uischema={form.ui}
            data={{}}
            renderers={materialRenderers}
            cells={materialCells}
          /> : undefined
      }
    </div>
  );
}

export default App;
