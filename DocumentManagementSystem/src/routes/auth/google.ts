import { Router } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../../lib/supabase";
import { ITokenData, IPayload } from "../../interface/auth";
import { signJWT, getTokens } from "../../lib/auth/utils";

const router = Router();

router.get("/signin", async (_req, res) => {
  // const { code } = req.body;

  const code = process.env.TEST_CODE as string;
  const { access_token, refresh_token, id_token } = (await getTokens(
    code
  )) as ITokenData;
  const { sub, name, email, picture } = jwt.decode(id_token) as IPayload;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("google_id", sub)
    .single();

  if (!user) {
    res.status(403).json({ message: "Not registered user" });

    return;
  }

  const token = signJWT({ sub, name, email, picture });
  const { error: userError } = await supabase
    .from("users")
    .update([
      {
        google_access_token: access_token,
        google_refresh_token: refresh_token,
      },
    ])
    .eq("google_id", sub);

  if (userError) {
    res.status(500).json({ message: "Failt to fetch users from database" });

    return;
  }

  console.log({ token });
  res.status(200).json({ token });

  return;
});

router.get("/signup", async (_req, res) => {
  const code = process.env.TEST_CODE as string;
  const { access_token, refresh_token, id_token } = await getTokens(code);
  const { sub, name, email, picture } = jwt.decode(id_token) as IPayload;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("google_id", sub)
    .single();

  if (!user) {
    const { error } = await supabase.from("users").insert([
      {
        email,
        name,
        google_id: sub,
        google_access_token: access_token,
        google_refresh_token: refresh_token,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      res.status(500).send("Internal server error");
    } else {
      const token = signJWT({ sub, name, email, picture });
      res.status(200).json({ token });
    }

    return;
  } else {
    res.status(403).json({ message: "Already registered user" });

    return;
  }
});

export default router;
