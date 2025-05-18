import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const { data: contacts, error } = await supabase.from("contacts").select("*");

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  } else {
    res.status(200).json(contacts);
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { name, phone, address } = req.body;

  const { data, error } = await supabase
    .from("contacts")
    .update([{ name, phone, address }])
    .eq("id", req.params.id)
    .select();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  } else {
    res.status(201).json(data[0]);
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { name, phone, address } = req.body;

  const { data, error } = await supabase
    .from("contacts")
    .insert([{ name, phone, address }])
    .select();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  } else {
    res.status(201).json(data[0]);
  }
});

export default router;
