const { upload, uploadToS3 } = require('../middleware/upload');  // Import both
const {protect} = require('../middleware/auth');
const express = require('express');
const router = express.Router();

// Upload image - ADD upload.single('file') middleware
router.post('/images/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = await uploadToS3(req.file);
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

module.exports = router;