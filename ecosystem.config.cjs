const path = require("path");

const root = __dirname;

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
      script: "npm",
      args: "run start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "motora-admin",
      cwd: path.join(root, "apps/admin"),
      script: "npm",
      args: "run start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
