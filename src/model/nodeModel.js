const mongoose = require("mongoose");

const NodeSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: [true, "ID là bắt buộc"],
  },

  port: {
    type: Number,
    required: [true, "Port là bắt buộc"],
    min: [1024, "Port phải lớn hơn 1024"],
    max: [65535, "Port phải nhỏ hơn 65535"],
  },

  status: {
    type: Number,
    enum: [0, 1], // 0: offline, 1: online
    default: 1,
  },

  last_ping: {
    type: Date,
    default: Date.now,
  },
});

const Node = mongoose.model("Node", NodeSchema);

module.exports = Node;
