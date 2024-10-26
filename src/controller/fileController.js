const File = require("../model/fileModel");
const Piece = require("../model/pieceModel");
const Node = require("../model/nodeModel");
const TorrentParser = require("../utils/Torrent");

const createFile = async (req, res) => {
  try {
    const { name, magnet_text, ip, port } = req.body;
    const torrentFile = req.file;

    if (!torrentFile) {
      return res
        .status(400)
        .json({ message: "Không có file torrent được tải lên" });
    }

    // Lưu file torrent vào cơ sở dữ liệu dưới dạng Buffer
    const file = await File.create({
      name,
      magnet_text,
      torrent_file: torrentFile.buffer,
    });

    // Phân tích file torrent
    const torrentParser = new TorrentParser(torrentFile.buffer);
    await torrentParser.parse();
    const allInfo = torrentParser.getAllInfo();

    // Tìm node dựa trên IP và port
    let node = await Node.findOne({ ip, port });
    if (!node) {
      node = await Node.create({ ip, port });
    }

    // Tạo các document Piece
    const pieces = [];
    for (let i = 0; i < allInfo.pieces; i++) {
      const piece = await Piece.create({
        file_id: file._id,
        piece_index: i,
        nodes: [node._id],
      });
      pieces.push(piece);
    }

    const { __v, _id, ...rest } = file._doc;

    console.log(
      "IP: ",
      ip,
      "Port: ",
      port,
      "File: ",
      file.name,
      "Pieces: ",
      pieces.length
    );

    return res.status(200).json({
      ...rest,
      // torrentInfo: allInfo,
      pieces: pieces.map((p) => ({ _id: p._id, piece_index: p.piece_index })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getPeers = async (req, res) => {
  const { magnet_text } = req.body;
  const file = await File.findOne({ magnet_text });
  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }
  const pieces = await Piece.find({ file_id: file._id })
    .select("piece_index nodes -_id")
    .populate("nodes", "ip port -_id");

  console.log("Get peers: ", pieces.length, "File: ", file.name);
  return res.status(200).json(pieces);
};

module.exports = { createFile, getPeers };
