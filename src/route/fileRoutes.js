const express = require("express");
const multer = require("multer");
const { createFile, getPeers, downloadTorrent, updatePeers } = require("../controller/fileController");
const router = express.Router();

// Cấu hình Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Thông báo file mới 
// Khi chia sẻ file thì gọi
router.post("/api/files", upload.single("torrent_file"), createFile);

// Lấy danh sách node chưa các thành phần của tệp
router.post("/api/files/peers", getPeers);

// Cập nhật node có chứa phần nào của tệp 
router.put("/api/pieces", updatePeers);

router.get("/api/files/:id/download", downloadTorrent);

module.exports = router;
