import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to Smsreader.web.ts
// and on native platforms to Smsreader.ts
import SmsreaderModule from './src/SmsreaderModule';

export function hello(): string {
  return SmsreaderModule.hello();
}

export function getMessagesFromSender(sender: string): any {
  return SmsreaderModule.getMessagesFromSender(sender);
}

export function getSenders(): string[] {
  return SmsreaderModule.getSenders()
}