import { Router } from "express";
import { verificationService } from "../services/verification.service";
import { isAuthenticated } from "../auth";
import { logger } from "../utils/logger";
import multer from "multer";
import { z } from "zod";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const verificationRequestSchema = z.object({
  verificationType: z.enum(['government_id', 'phone', 'email', 'biometric', 'address']),
  documentType: z.enum(['passport', 'drivers_license', 'national_id', 'utility_bill']).optional(),
  documentData: z.object({
    documentNumber: z.string().optional(),
    expiryDate: z.coerce.date().optional(),
    issueDate: z.coerce.date().optional(),
    issuingAuthority: z.string().optional(),
    frontImageUrl: z.string().optional(),
    backImageUrl: z.string().optional(),
    selfieImageUrl: z.string().optional(),
  }).optional(),
  phoneData: z.object({
    phoneNumber: z.string(),
    verificationCode: z.string().optional(),
  }).optional(),
  emailData: z.object({
    email: z.string().email(),
    verificationCode: z.string().optional(),
  }).optional(),
  biometricData: z.object({
    faceImageUrl: z.string(),
    livenessScore: z.number().optional(),
  }).optional(),
  addressData: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    documentImageUrl: z.string().optional(),
  }).optional(),
});

/**
 * Process verification request
 */
router.post("/process", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const validatedData = verificationRequestSchema.parse(req.body);

    const verificationRequest = {
      userId,
      ...validatedData
    };

    const result = await verificationService.processVerificationRequest(verificationRequest);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: error.errors
      });
    }

    logger.error('VERIFICATION_API', 'Error processing verification request', { error });
    res.status(500).json({
      success: false,
      message: "Failed to process verification request"
    });
  }
});

/**
 * Upload document images for verification
 */
router.post("/upload-documents", 
  isAuthenticated, 
  upload.fields([
    { name: 'frontImage', maxCount: 1 },
    { name: 'backImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const uploadedFiles: { [key: string]: string } = {};

      // In production, upload files to cloud storage (AWS S3, Google Cloud Storage, etc.)
      // For now, we'll simulate the upload and return mock URLs
      for (const [fieldName, fileArray] of Object.entries(files)) {
        if (fileArray && fileArray.length > 0) {
          const file = fileArray[0];
          // Simulate file upload to cloud storage
          const mockUrl = `https://verification-storage.example.com/${userId}/${fieldName}_${Date.now()}.${file.mimetype.split('/')[1]}`;
          uploadedFiles[fieldName] = mockUrl;
        }
      }

      res.json({
        success: true,
        uploadedFiles
      });
    } catch (error) {
      logger.error('VERIFICATION_API', 'Error uploading documents', { error });
      res.status(500).json({
        success: false,
        message: "Failed to upload documents"
      });
    }
  }
);

/**
 * Send verification code (phone/email)
 */
router.post("/send-code", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { type, contact } = req.body;

    if (!type || !contact) {
      return res.status(400).json({
        message: "Type and contact information are required"
      });
    }

    if (type === 'phone') {
      const result = await verificationService.processVerificationRequest({
        userId,
        verificationType: 'phone',
        phoneData: { phoneNumber: contact }
      });

      res.json({
        success: true,
        message: "Verification code sent to phone",
        verificationId: result.verificationId
      });
    } else if (type === 'email') {
      const result = await verificationService.processVerificationRequest({
        userId,
        verificationType: 'email',
        emailData: { email: contact }
      });

      res.json({
        success: true,
        message: "Verification code sent to email",
        verificationId: result.verificationId
      });
    } else {
      res.status(400).json({
        message: "Invalid verification type"
      });
    }
  } catch (error) {
    logger.error('VERIFICATION_API', 'Error sending verification code', { error });
    res.status(500).json({
      success: false,
      message: "Failed to send verification code"
    });
  }
});

/**
 * Verify code (phone/email)
 */
router.post("/verify-code", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { type, contact, code } = req.body;

    if (!type || !contact || !code) {
      return res.status(400).json({
        message: "Type, contact, and verification code are required"
      });
    }

    let result;
    if (type === 'phone') {
      result = await verificationService.processVerificationRequest({
        userId,
        verificationType: 'phone',
        phoneData: { phoneNumber: contact, verificationCode: code }
      });
    } else if (type === 'email') {
      result = await verificationService.processVerificationRequest({
        userId,
        verificationType: 'email',
        emailData: { email: contact, verificationCode: code }
      });
    } else {
      return res.status(400).json({
        message: "Invalid verification type"
      });
    }

    res.json({
      success: result.success,
      result
    });
  } catch (error) {
    logger.error('VERIFICATION_API', 'Error verifying code', { error });
    res.status(500).json({
      success: false,
      message: "Failed to verify code"
    });
  }
});

/**
 * Get user verification status
 */
router.get("/status", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get current user verification status from database
    const { storage } = await import("../storage");
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verificationStatus = {
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      governmentIdVerified: user.governmentIdVerified,
      verificationStatus: user.verificationStatus,
      verificationLevel: calculateUserVerificationLevel(user)
    };

    res.json({
      success: true,
      verificationStatus
    });
  } catch (error) {
    logger.error('VERIFICATION_API', 'Error getting verification status', { error });
    res.status(500).json({
      success: false,
      message: "Failed to get verification status"
    });
  }
});

/**
 * Admin endpoint to get verification statistics
 */
router.get("/admin/statistics", isAuthenticated, async (req, res) => {
  try {
    // This would be admin-only in production
    if (!req.user?.isAdmin) {
      return res.status(403).json({ 
        message: "Admin access required" 
      });
    }

    // Mock verification statistics (in production, query from database)
    const statistics = {
      totalVerifications: 2847,
      pendingReviews: 156,
      approvedToday: 89,
      rejectedToday: 12,
      verificationLevels: {
        bronze: 1245,
        silver: 892,
        gold: 567,
        platinum: 143
      },
      documentTypes: {
        passport: 45,
        driversLicense: 35,
        nationalId: 15,
        utilityBill: 5
      },
      averageProcessingTime: "4.2 hours",
      successRate: 89.3
    };

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    logger.error('VERIFICATION_API', 'Error getting verification statistics', { error });
    res.status(500).json({
      success: false,
      message: "Failed to get verification statistics"
    });
  }
});

/**
 * Calculate user verification level
 */
function calculateUserVerificationLevel(user: any): number {
  let level = 0;
  if (user.emailVerified) level++;
  if (user.phoneVerified) level++;
  if (user.governmentIdVerified) level++;
  if (user.verificationStatus === 'verified') level++;
  return level;
}

export default router;