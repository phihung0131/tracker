const Node = require("../model/nodeModel");

const onlNode = async (req, res) => {
  const { ip, port } = req.body;
  const node = await Node.findOne({ ip, port });
  if (node) {
    node.status = 1;
    node.last_ping = new Date();
    await node.save();
    const { __v, _id, ...rest } = node._doc;
    console.log("IP: ", ip, "Port: ", port, "Status: ", 1);
    return res.status(200).json(rest);
  }

  const newNode = await Node.create({
    ip,
    port,
  });
  const { __v, _id, ...rest } = newNode._doc;
  console.log("IP: ", ip, "Port: ", port, "Status: ", 1);
  return res.status(200).json(rest);
};

const offNode = async (req, res) => {
  const { ip, port } = req.body;
  const node = await Node.findOne({ ip, port });
  if (node) {
    node.status = 0;
    await node.save();
    const { __v, _id, ...rest } = node._doc;
    return res.status(200).json(rest);
  }
  return res.status(404).json({ message: "Node not found" });
};

module.exports = { onlNode, offNode };
