const path = require("path");

const root = path.resolve(__dirname, "..");

module.exports = {
  apps: [
    {
      name: "motora-api",
      cwd: path.join(root, "apps/api"),
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
    {
      name: "motora-web",
      cwd: path.join(root, "apps/web"),
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "motora-admin",
      cwd: path.join(root, "apps/admin"),
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
