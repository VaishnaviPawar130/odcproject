import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { updateCourierAudio } from "./courierEntries.controller";

import {
  createCourierEntry,
  getCourierEntries,
  getCourierEntryById,
  updateCourierEntry,
  deleteCourierEntry,
} from "./courierEntries.controller";

const router = Router();

// ======================
// MULTER CONFIG
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subFolder = file.fieldname === "audio" ? "audio" : "images";
    const destinationPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      subFolder
    );

    fs.mkdirSync(destinationPath, { recursive: true });
    cb(null, destinationPath);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ======================
// ROUTES
// ======================
router.post("/", upload.single("picture"), createCourierEntry);

router.get("/", getCourierEntries);

router.get("/:id", getCourierEntryById);

router.put("/:id", upload.single("picture"), updateCourierEntry);

router.put("/:id/audio", upload.single("audio"), updateCourierAudio);


router.delete("/:id", deleteCourierEntry);

export default router;
