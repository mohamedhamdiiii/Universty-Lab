const multer = require('multer')
const path = require('path')

// Configure where to save uploaded files and how to name them
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Save files in the "uploads" folder
    },
    filename: function (req, file, cb) {
        // Create a unique filename: timestamp + original name
        const uniqueName = Date.now() + '-' + file.originalname
        cb(null, uniqueName)
    }
})

// Filter to only allow image files (JPG, JPEG, PNG)
const fileFilter = function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true) // Accept the file
    } else {
        cb(new Error('Only JPG, JPEG and PNG images are allowed'), false)
    }
}

// Create the multer upload middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Max 5MB
    }
})

module.exports = upload
