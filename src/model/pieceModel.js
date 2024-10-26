const mongoose = require("mongoose");

const PieceSchema = new mongoose.Schema({

  file_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    required: [true, "File ID là bắt buộc"],
  },

  piece_index: {
    type: Number,
    required: [true, "Piece index là bắt buộc"],
  },

  nodes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Node",
    },
  ],
});

const Piece = mongoose.model("Piece", PieceSchema);

module.exports = Piece;
