import { Router } from "express";
import { authenticateJWT } from "../lib/auth/middlewares";
import { supabase } from "../lib/supabase";
import { uploadToGoogleDrive } from "../lib/documents/utils";
import multer from "multer";

const router = Router();
const upload = multer();

router.get("/", authenticateJWT, async (_req, res) => {
  const { data: documents, error: docError } = await supabase
    .from("documents")
    .select("*");

  if (docError) {
    res.status(500).json({ error: "Failed to fetch documents." });
    return;
  }

  res.status(200).json({ documents });
});

router.get("/:contactId", authenticateJWT, async (req, res) => {
  const contactId = req.params.contactId;

  const { data: documents, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("contact_id", contactId);

  if (docError) {
    res.status(500).json({ error: "Failed to fetch documents." });
    return;
  }

  res.status(200).json({ documents });
});

router.post(
  "/upload/:contactId",
  authenticateJWT,
  upload.single("file"),
  async (req, res) => {
    const contactId = req.params.contactId;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "File is required." });
      return;
    }

    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .single();

    if (contactError) {
      res.status(500).json({ error: "Failed to fetch contacts." });
      return;
    }

    // View user for getting acces token of google
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("*")
      .eq("id", (contact as any).manager_id)
      .single();

    if (currentUserError) {
      console.error(currentUserError);
      res.status(500).json({ message: "Failed to fetch users." });
      return;
    }

    // Upload
    try {
      const info = await uploadToGoogleDrive({
        accessToken: currentUser.google_access_token,
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
      });

      const { data: doc, error: docError } = await supabase
        .from("documents")
        .select("*")
        .eq("contact_id", contactId)
        .eq("file_name", file.originalname)
        .maybeSingle();

      if (docError) {
        console.error(docError);
        res.status(500).json({ error: "Fail to fetch from documents" });
      }

      if (!doc) {
        await supabase.from("documents").insert({
          contact_id: contactId,
          file_name: file.originalname,
          uploaded_at: new Date().toISOString(),
          drive_url: info.webViewLink, // uploadToGoogleDrive 함수에서 return 받도록 수정
        });
      } else {
        console.log(`Already exist : ${file.originalname}`);
        await supabase
          .from("documents")
          .update([
            {
              uploaded_at: new Date().toISOString(),
              drive_url: info.webViewLink,
            },
          ])
          .eq("contact_id", contactId)
          .eq("file_name", file.originalname);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error : Upload Google Drive");
      return;
    }

    res.status(200).json({ message: "Success to upload in google drive" });
  }
);

router.post(
  "/upload-multiple/:contactId",
  upload.array("files"),
  async (req, res) => {
    const files = req.files as Express.Multer.File[];
    const contactId = req.params.contactId;

    await Promise.all(
      files.map(async (file) => {
        if (!file) {
          res.status(400).json({ error: "File is required." });
          return;
        }
        const { data: contact, error: contactError } = await supabase
          .from("contacts")
          .select("*")
          .eq("id", contactId)
          .single();

        if (contactError) {
          res.status(500).json({ error: "Failed to fetch contacts." });
          return;
        }

        // View user for getting acces token of google
        const { data: currentUser, error: currentUserError } = await supabase
          .from("users")
          .select("*")
          .eq("id", (contact as any).manager_id)
          .single();

        if (currentUserError) {
          console.error(currentUserError);
          res.status(500).json({ message: "Failed to fetch users." });
          return;
        }

        // Upload
        try {
          console.log("Start uplaod");
          const info = await uploadToGoogleDrive({
            accessToken: currentUser.google_access_token,
            fileBuffer: file.buffer,
            fileName: file.originalname,
            mimeType: file.mimetype,
          });

          await supabase.from("documents").insert({
            contact_id: contactId,
            file_name: file.originalname,
            uploaded_at: new Date().toISOString(),
            drive_url: info.webViewLink, // uploadToGoogleDrive 함수에서 return 받도록 수정
          });

          console.log("Success to upload");
        } catch (error) {
          console.error(error);
          res.status(500).send("Internal Server Error : Upload Google Drive");
          return;
        }
      })
    );

    res.status(200).json({ message: "Success to upload in google drive" });
  }
);

export default router;
