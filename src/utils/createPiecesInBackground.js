const Piece = require("../model/pieceModel");
const File = require("../model/fileModel");

async function createPiecesInBackground(fileId, totalPieces, nodeId) {
  try {
    for (let i = 0; i < totalPieces; i++) {
      await Piece.create({
        file_id: fileId,
        piece_index: i,
        nodes: [nodeId],
      });
      
      // Thêm một khoảng thời gian nhỏ giữa mỗi lần tạo piece để tránh quá tải hệ thống
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Cập nhật file với bitmap
    const file = await File.findById(fileId);
    file.status = "completed";
    await file.save();

    console.log(`Đã tạo xong ${totalPieces} pieces cho file ${fileId}`);
  } catch (error) {
    console.error(`Lỗi khi tạo pieces cho file ${fileId}:`, error);
  }
}

module.exports = createPiecesInBackground;
