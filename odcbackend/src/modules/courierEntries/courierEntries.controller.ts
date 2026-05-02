import { Request, Response } from "express";
import { promises as fs } from "fs";
import path from "path";
import {
  createCourierEntryService,
  getCourierEntriesService,
  getCourierEntryByIdService,
  updateCourierEntryService,
  deleteCourierEntryService,
} from "./courierEntries.services";

// Proper typing for :id params
type IdParams = {
  id: string;
};

// CREATE
export const createCourierEntry = async (
  req: Request,
  res: Response
) => {
  try {
    const data = {
      ...req.body,
      picture: req.file ? req.file.path : null,
    };

    const result = await createCourierEntryService(data);

    res.status(201).json({
      success: true,
      message: "Courier entry created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL WITH PAGINATION
export const getCourierEntries = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const year =
      typeof req.query.year === "string"
        ? req.query.year
        : undefined;

    const month =
      typeof req.query.month === "string"
        ? Number(req.query.month)
        : undefined;

    const result = await getCourierEntriesService({
      year,
      month,
      page,
      limit,
    });

    res.json({
      success: true,
      total: result.total,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      pageSize: result.pageSize,
      data: result.data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET BY ID
export const getCourierEntryById = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    const result = await getCourierEntryByIdService(
      req.params.id
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
export const updateCourierEntry = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    const data: any = { ...req.body };

    if (req.file) {
      data.picture = req.file.path;
    } else if (req.body.pictureBase64) {
      const base64Data = req.body.pictureBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const filename = Date.now() + "-base64-" + req.params.id + ".jpg";
      const filepath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "images",
        filename
      );

      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, buffer);
      data.picture = filepath;
    } else if (req.body.audioBase64) {
      const base64Data = req.body.audioBase64.replace(/^data:audio\/[\w.+-]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const filename = Date.now() + "-base64-audio-" + req.params.id + ".m4a";
      const filepath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "audio",
        filename
      );

      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, buffer);
      data.audio = filepath;
    }

    const result = await updateCourierEntryService(
      req.params.id,
      data
    );

    res.json({
      success: true,
      message: "Updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//updat audio
export const updateCourierAudio = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required",
      });
    }

    const result = await updateCourierEntryService(req.params.id, {
      audio: req.file.path,
    });

    res.json({
      success: true,
      message: "Audio uploaded successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
export const deleteCourierEntry = async (
  req: Request<IdParams>,
  res: Response
) => {
  try {
    await deleteCourierEntryService(req.params.id);

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
