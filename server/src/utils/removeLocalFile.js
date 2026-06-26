import fs from "fs";

export const removeLocalFile = (path) => {
  if (path && fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};