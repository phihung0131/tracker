const File = require("../model/fileModel");
const Piece = require("../model/pieceModel");
const Node = require("../model/nodeModel");
const TorrentParser = require("../utils/Torrent");
const createPiecesInBackground = require("../utils/createPiecesInBackground");

const createFile = async (req, res) => {
  try {
    const { name, magnet_text, ip, port } = req.body;
    const torrentFile = req.file;

    if (!torrentFile) {
      return res
        .status(400)
        .json({ message: "Không có file torrent được tải lên" });
    }

    console.log("Kích thước file torrent:", torrentFile.buffer.length, "bytes");

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

    // Bắt đầu quá trình tạo piece trong nền
    createPiecesInBackground(file._id, allInfo.pieces, node._id);

    const { __v, _id, ...rest } = file._doc;
    return res.status(200).json({
      ...rest,
      torrentInfo: allInfo,
      torrentFileSize: torrentFile.buffer.length,
      message: "File đã được tạo. Các piece đang được xử lý trong nền.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getPeers = async (req, res) => {
  try {
    const { magnet_text } = req.body;
    const file = await File.findOne({ magnet_text });
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const pieces = await Piece.find({ file_id: file._id })
      .select("piece_index nodes -_id")
      .populate("nodes", "ip port -_id");

    // Tạo danh sách peer từ các piece
    const peers = pieces.reduce((acc, piece) => {
      piece.nodes.forEach((node) => {
        if (
          !acc.some((peer) => peer.ip === node.ip && peer.port === node.port)
        ) {
          acc.push({ ip: node.ip, port: node.port });
        }
      });
      return acc;
    }, []);

    console.log(
      "Kích thước file torrent từ database:",
      file.torrent_file.length,
      "bytes"
    );

    // Trả về file torrent, thông tin torrent, các piece và danh sách peer
    console.log("Get peers: ", peers.length, "File: ", file.name);
    return res.status(200).json({
      name: file.name,
      magnet_text: file.magnet_text,
      status: file.status,
      torrentFileSize: file.torrent_file.length,
      torrentFile: file.torrent_file.toString("base64"), // Trả về file torrent dưới dạng base64
      pieces: pieces,
      // peers: peers
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const downloadTorrent = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.set("Content-Type", "application/x-bittorrent");
    res.set(
      "Content-Disposition",
      `attachment; filename="${file.name}.torrent"`
    );
    res.send(file.torrent_file);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const updatePeers = async (req, res) => {
  const { magnet_text, piece_index, ip, port } = req.body;
  // console.log(piece_index, ip, port, magnet_text);
  const file = await File.findOne({ magnet_text });
  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }
  const piece = await Piece.findOne({ file_id: file._id, piece_index });
  if (!piece) {
    return res.status(404).json({ message: "Piece not found" });
  }
  let node = await Node.findOne({ ip, port });
  if (!node) {
    node = await Node.create({ ip, port });
  }
  if (!piece.nodes.includes(node._id)) {
    piece.nodes.push(node._id);
    await piece.save();
  }
  return res.status(200).json({ message: "Peers updated successfully" });
};

module.exports = { createFile, getPeers, downloadTorrent, updatePeers };
