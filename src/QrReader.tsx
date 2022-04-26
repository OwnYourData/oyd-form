import React from 'react';
import { QrReader as ReactQrReader } from 'react-qr-reader';
import './App.css';

interface Props {
  onText: (text: string) => void,
}

export function QrReader(props: Props) {
  return (
    <ReactQrReader
      constraints={{
        facingMode: 'environment',
      }}
      onResult={(result) => {
        if (!!result) {
          props.onText(result.getText());
        }
      }}
    />
  );
}