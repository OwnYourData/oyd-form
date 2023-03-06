import React, { useCallback, useEffect, useState } from 'react';
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
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextArea from '@material-ui/core/TextareaAutosize';

function App() {
  const [vaultifier, setVaultifier] = useState<Vaultifier>();

  const [schemaDri, setSchemaDri] = useState<string | undefined>();
  const [tag, setTag] = useState<string | undefined>();
  const [language, setLanguage] = useState<string | undefined>();

  const [form, setForm] = useState<SoyaForm | undefined>(undefined);
  const [data, setData] = useState<any>({});
  const [textData, setTextData] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchForm = useCallback(async () => {
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
  }, [language, schemaDri, tag, vaultifier]);

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
      try {
        const { searchParams } = new URL(window.location.href);

        const data = searchParams.get('data');
        if (data)
          try {
            setData(JSON.parse(decodeURIComponent(data)));
          } catch { }

        setSchemaDri(searchParams.get('schemaDri') ?? undefined);
        setTag(searchParams.get('tag') ?? undefined);
        setLanguage(searchParams.get('language') ?? undefined);

        fetchForm();
      } catch { }
    })();
  }, [fetchForm]);

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
          <>
            <JsonForms
              schema={form.schema}
              uischema={form.ui}
              data={data}
              renderers={materialRenderers}
              cells={materialCells}
              onChange={({ errors, data }) => {
                setData(data);
                setTextData(JSON.stringify(data, null, 2))
              }}
            />
            <h2>Data</h2>
            <Card>
              <CardContent>
                <TextArea
                  value={textData}
                  style={{ 'width': '100%' }}
                  onChange={(e) => {
                    const text = e.target.value;
                    setTextData(text);

                    try {
                      const data = JSON.parse(text);
                      setData(data);
                    } catch { }
                  }}
                />
              </CardContent>
            </Card>
          </>
          : undefined
      }
    </div>
  );
}

export default App;
