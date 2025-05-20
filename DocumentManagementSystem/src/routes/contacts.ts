import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

router.get(
  "/:managerId",
  async (req: Request, res: Response): Promise<void> => {
    const { data: contacts, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("manager_id", req.params.managerId);

    if (error) {
      console.error("Error fetching contacts: ", error);
      res.status(500).send(error.message);
      return;
    } else {
      res.status(200).json({ contacts });
    }
  }
);

router.patch("/:managerId", async (req: Request, res: Response) => {
  const { id, name, phone, address } = req.body;

  const { data, error } = await supabase
    .from("contacts")
    .update([{ name, phone, address }])
    .eq("id", id)
    .eq("manager_id", req.params.managerId)
    .select();

  if (error) {
    res.status(500).send(error.message);
    return;
  } else {
    res.status(201).json({ contact: data[0] });
  }
});

router.post("/:managerId", async (req: Request, res: Response) => {
  const { name, phone, address } = req.body;

  const { data, error } = await supabase
    .from("contacts")
    .insert([{ name, phone, address }])
    .eq("manager_id", req.params.managerId)
    .select();

  if (error) {
    res.status(500).send(error.message);
    return;
  } else {
    res.status(201).json({ contact: data[0] });
  }
});

export default router;
