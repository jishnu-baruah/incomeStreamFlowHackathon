// types/okx.d.ts

declare module '@okxconnect/ui' {
    interface Namespace {
      accounts: string[];
      chains: string[];
    }
  
    interface WalletSession {
      namespaces: {
        eip155: Namespace;
      };
    }
  
    export interface OKXUIPreferences {
      theme: THEME;
    }
  
    export interface OKXDappMetaData {
      name: string;
      icon: string;
    }
  
    export interface OKXActionsConfiguration {
      returnStrategy: 'none' | 'tg://resolve';
      modals: 'all' | string[];
    }
  
    export interface OKXInitOptions {
      dappMetaData: OKXDappMetaData;
      actionsConfiguration: OKXActionsConfiguration;
      uiPreferences: OKXUIPreferences;
    }
  
    export interface OKXModalOptions {
      namespaces: {
        eip155: {
          chains: string[];
          defaultChain?: string;
        };
      };
    }
  
    export enum THEME {
      LIGHT = 'light',
      DARK = 'dark'
    }
  
    export class OKXUniversalConnectUI {
      static init(options: OKXInitOptions): Promise<OKXUniversalConnectUI>;
      openModal(options: OKXModalOptions): Promise<WalletSession>;
      disconnect(): Promise<void>;
    }
  }