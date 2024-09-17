import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { SmsreaderViewProps } from './Smsreader.types';

const NativeView: React.ComponentType<SmsreaderViewProps> =
  requireNativeViewManager('Smsreader');

export default function SmsreaderView(props: SmsreaderViewProps) {
  return <NativeView {...props} />;
}
