import jwt from "jsonwebtoken";
import { IPayload, ITokenData } from "../../interface/auth";

const {
  GOOGLE_CLIENT_ID: CLIENT_ID,
  GOOGLE_REDIRECT_URI: REDIRECT_URI,
  GOOGLE_CLIENT_SECRET: CLIENT_SECRET,
  JWT_SECRET,
} = process.env;

const EXPIRES_IN = "1h";

export function signJWT(user: IPayload): string {
  return jwt.sign(user, JWT_SECRET as string, { expiresIn: EXPIRES_IN });
}

export async function getTokens(code: string): Promise<ITokenData> {
  const tokens: ITokenData = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID as string,
        client_secret: CLIENT_SECRET as string,
        redirect_uri: REDIRECT_URI as string,
        grant_type: "authorization_code",
      }),
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  return tokens;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<string> {
  const access_token = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })
    .then((res) => {
      const data = res.json() as any;
      return data.access_token;
    })
    .catch((error) => {
      console.error(error);
      throw new Error("Failed to refresh access token");
    });

  return access_token;
}
