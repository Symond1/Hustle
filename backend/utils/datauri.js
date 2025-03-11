import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
    if (!file || !file.buffer || !file.originalname) {
        throw new Error("Invalid file object provided.");
    }

    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toLowerCase();

    // Supported file types
    const supportedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx", ".gif"];

    if (!supportedExtensions.includes(extName)) {
        throw new Error("Unsupported file type.");
    }

    return parser.format(extName, file.buffer);
};

export default getDataUri;
