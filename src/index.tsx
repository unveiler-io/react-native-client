import { NativeModules } from 'react-native';

type ReactNativeClientType = {
  multiply(a: number, b: number): Promise<number>;
};

const { ReactNativeClient } = NativeModules;

export default ReactNativeClient as ReactNativeClientType;
