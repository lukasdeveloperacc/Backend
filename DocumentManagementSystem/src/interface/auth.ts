export interface ITokenData {
  access_token: string;
  refresh_token: string;
  id_token: string;
}

export interface IPayload {
  sub: string | null;
  email: string;
  name: string;
  picture: string | null;
}
