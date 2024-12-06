const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  devtool: "inline-source-map",
  entry: {
    background: "./src/background.js",
    popup: "./src/popup/popup.js", // Popup entry
    options: "./src/options/options.js", // Options page entry
    contentScript: "./src/contentScript.js", // Content script entry
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js", // Output file name
  },
  resolve: {
    extensions: [".ts", ".js"], // Resolves both TypeScript and JS files
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader", // Use ts-loader to compile TypeScript files
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"], // For loading CSS
      },
      {
        test: /\.(jpeg|webp)$/,
        use: "file-loader", // To load image files like icons
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/options/index.html", to: "options/index.html" },
        { from: "src/options/options.css", to: "options/options.css" },
        { from: "src/options/options.js", to: "options/options.js" },
        { from: "src/popup/index.html", to: "popup/index.html" },
        { from: "src/popup/popup.css", to: "popup/popup.css" },
        { from: "src/popup/popup.js", to: "popup/popup.js" },
        { from: "src/assets/icons", to: "assets/icons" }, // Copy icons
      ],
    }),
  ],
};
