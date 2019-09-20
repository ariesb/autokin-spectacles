const path = require('path');
const nodeExternals = require('webpack-node-externals');
module.exports = {
  target: "node",
  entry: {
    app: ["./server/src/server.js"]
  },
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "spectacles.js"
  },
  externals: [nodeExternals()],
};