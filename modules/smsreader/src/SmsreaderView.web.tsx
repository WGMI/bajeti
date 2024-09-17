import * as React from 'react';

import { SmsreaderViewProps } from './Smsreader.types';

export default function SmsreaderView(props: SmsreaderViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
