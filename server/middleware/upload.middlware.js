import multer from 'multer'

const storage = multer.diskStorage({
    distination: (req, file, cb)=>{
        cb(null, "uploads/");
    },
    filname:(req, file, cb)=>{
    cb(null, Date.now()+'-'+file.originalname);
    }
});

const upload = multer({storage});

export default upload;
