import cloudinary from "../config/cloundinary.js";
import fs from "fs";

const uploadToCloudinary = async (filePath) =>{
    const result = await cloudinary.uploader.upload(filePath, {
        folder: "Products",
    })

    fs.unlinkSync(filePath); //delete temp file

    return{
        url:result.secure_url,
        public_id: result.public_id
    };
};

export default uploadToCloudinary;