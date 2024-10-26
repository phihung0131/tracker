const express = require("express");
const router = express.Router();

const { onlNode, offNode } = require("../controller/nodeController");

// Đăng ký node mới, duy trì
// Online thì gọi
router.post("/api/nodes", onlNode);

// Cập nhật trạng thái node
// Offline thì gọi
router.put("/api/nodes", offNode);

module.exports = router;
