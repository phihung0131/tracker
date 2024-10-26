const fs = require("fs");
const bencode = require("bencode");
const crypto = require('crypto');

class TorrentParser {
  constructor(torrentBuffer) {
    this.torrentBuffer = torrentBuffer;
    this.torrentData = null;
  }

  // Đọc và parse file torrent
  async parse() {
    try {
      this.torrentData = bencode.decode(this.torrentBuffer);
      return this.torrentData;
    } catch (error) {
      throw new Error(`Không thể đọc file torrent: ${error.message}`);
    }
  }

  // Lấy thông tin cơ bản
  getBasicInfo() {
    if (!this.torrentData) {
      throw new Error("Vui lòng gọi parse() trước");
    }

    return {
      name: this.torrentData.info.name.toString("utf8"),
      comment: this.torrentData.comment
        ? this.torrentData.comment.toString("utf8")
        : null,
      createdBy: this.torrentData["created by"]
        ? this.torrentData["created by"].toString("utf8")
        : null,
      creationDate: this.torrentData["creation date"]
        ? new Date(this.torrentData["creation date"] * 1000)
        : null,
      encoding: this.torrentData.encoding
        ? this.torrentData.encoding.toString("utf8")
        : null,
      pieceLength: this.torrentData.info["piece length"],
    };
  }

  // Lấy danh sách trackers
  getTrackers() {
    if (!this.torrentData) {
      throw new Error("Vui lòng gọi parse() trước");
    }

    const trackers = [];

    if (this.torrentData["announce-list"]) {
      this.torrentData["announce-list"].forEach((tracker) => {
        trackers.push(tracker[0].toString("utf8"));
      });
    } else if (this.torrentData.announce) {
      trackers.push(this.torrentData.announce.toString("utf8"));
    }

    return trackers;
  }

  // Lấy thông tin về files
  getFiles() {
    if (!this.torrentData) {
      throw new Error("Vui lòng gọi parse() trước");
    }

    const files = [];
    if (this.torrentData.info.files) {
      // Multi-file mode
      this.torrentData.info.files.forEach((file) => {
        files.push({
          path: file.path.map((p) => p.toString("utf8")).join("/"),
          length: file.length,
        });
      });
    } else {
      // Single file mode
      files.push({
        path: this.torrentData.info.name.toString("utf8"),
        length: this.torrentData.info.length,
      });
    }

    return files;
  }

  // Tính tổng dung lượng
  getTotalSize() {
    const files = this.getFiles();
    return files.reduce((total, file) => total + file.length, 0);
  }

  // Thêm phương thức mới này
  getAllInfo() {
    if (!this.torrentData) {
      throw new Error("Vui lòng gọi parse() trước");
    }

    return {
      basicInfo: this.getBasicInfo(),
      trackers: this.getTrackers(),
      files: this.getFiles(),
      totalSize: this.getTotalSize(),
      pieces: this.torrentData.info.pieces.length / 20, // Số lượng pieces
      pieceLength: this.torrentData.info["piece length"],
      private: this.torrentData.info.private ? "Yes" : "No",
      announceList: this.torrentData["announce-list"] 
        ? this.torrentData["announce-list"].map(a => a[0].toString('utf8'))
        : [],
      infoHash: this.getInfoHash(),
    };
  }

  // Thêm phương thức để lấy info hash
  getInfoHash() {
    const crypto = require('crypto');
    const infoBuffer = bencode.encode(this.torrentData.info);
    return crypto.createHash('sha1').update(infoBuffer).digest('hex');
  }
}

module.exports = TorrentParser;

// Ví dụ sử dụng (có thể giữ nguyên hoặc cập nhật)
// async function main() {
//   try {
//     const parser = new TorrentParser("./src/utils/ccc.png.torrent");
//     await parser.parse();
//     console.log("Toàn bộ thông tin torrent:");
//     console.log(JSON.stringify(parser.getAllInfo(), null, 2));
//   } catch (error) {
//     console.error("Lỗi:", error.message);
//   }
// }

// main();
