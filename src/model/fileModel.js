const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name là bắt buộc"],
  },

  magnet_text: {
    type: String,
    required: [true, "Magnet text là bắt buộc"],
    unique: true,
  },

  torrent_file: {
    type: Buffer,
    required: [true, "Torrent file là bắt buộc"],
  },

  status: {
    type: String,
    enum: ['processing', 'completed', 'error'],
    default: 'processing'
  }
});

const File = mongoose.model("File", FileSchema);

module.exports = File;
