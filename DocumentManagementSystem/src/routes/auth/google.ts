import { Router } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../../lib/supabase";
import { ITokenData, IPayload } from "../../interface/auth";
import { signJWT, getTokens } from "../../lib/auth/utils";

const router = Router();

router.post("/signin", async (req, res) => {
  const { code } = req.body;
  console.log("Code ", code);
  const { access_token, refresh_token, id_token } = (await getTokens(
    code
  )) as ITokenData;
  console.log("Token : ", id_token);
  const { sub, name, email, picture } = jwt.decode(id_token) as IPayload;
  console.log("Decoded token: ", { sub, name, email, picture });
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("google_id", sub)
    .single();

  let userId = user?.id;

  if (!user) {
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          name,
          google_id: sub,
          google_access_token: access_token,
          google_refresh_token: refresh_token,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      res.status(500).send("Internal server error");
    } else {
      userId = newUser[0].id;
      console.log("User created");
    }
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
    res.status(500).send("Fail to fetch users from database");

    return;
  }

  res.status(200).json({ token, userId });
});

export default router;
