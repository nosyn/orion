export type Credential = {
  id?: number;
  host: string;
  port: number;
  username: string;
  authType: 'password' | 'key';
  password?: string | null;
  privateKeyPath?: string | null;
};
