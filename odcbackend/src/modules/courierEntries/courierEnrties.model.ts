import { Schema, model, Types } from "mongoose";

const CourierEntrySchema = new Schema(
  {
    // Selected courier from dropdown
    courierId: {
      type: Types.ObjectId,
      ref: "courier_masters",
      required: true,
    },

    // Quantity of boxes
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Collected by person name
    collectedBy: {
      type: String,
      required: true,
      trim: true,
    },

    // Phone number
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional photo path / image URL
    picture: {
      type: String,
      default: null,
      trim: true,
    },

    // audio
    audio: {
      type: String,
      required: false,
      trim: true,
    },

    // Entry date
    entryDate: {
      type: Date,
      default: Date.now,
    },

    // Soft delete support
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const CourierEntry = model(
  "CourierEntries",
  CourierEntrySchema
);