import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import Admin from '../models/admin.model.js';
import cloudinary, { configureCloudinary, CLOUDINARY_FOLDERS } from '../config/cloudinary.js';

const uploadToCloudinary = (buffer, originalname) => {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const ext = originalname.split('.').pop();
    const publicId = `admin-profile-${Date.now()}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDERS.ADMIN_PROFILE,
        public_id: publicId,
        resource_type: 'image',
        format: ext,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  configureCloudinary();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Failed to delete image from Cloudinary', publicId, err);
  }
};

export const getProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);

  return res.status(200).json({
    success: true,
    user: {
      id: admin._id,
      profileImage: admin.profileImage || '',
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone || '',
      role: admin.role,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin || null,
      createdAt: admin.createdAt,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;

  const updateData = {};

  if (fullName !== undefined) {
    const trimmed = (fullName || '').trim();
    if (trimmed.length < 3 || trimmed.length > 100) {
      throw new ApiError(400, 'Full name must be between 3 and 100 characters');
    }
    updateData.fullName = trimmed;
  }

  if (phone !== undefined) {
    const trimmed = (phone || '').trim();
    if (!/^03\d{9}$/.test(trimmed)) {
      throw new ApiError(400, 'Please enter a valid Pakistani mobile number (03XXXXXXXXX)');
    }
    updateData.phone = trimmed;
  }

  const adminToUpdate = await Admin.findById(req.user._id);

  if (req.file) {
    if (adminToUpdate.profileImagePublicId) {
      await deleteFromCloudinary(adminToUpdate.profileImagePublicId);
    }
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    updateData.profileImage = result.secure_url;
    updateData.profileImagePublicId = result.public_id;
  }

  if (updateData.fullName) adminToUpdate.fullName = updateData.fullName;
  if (updateData.phone !== undefined) adminToUpdate.phone = updateData.phone;
  if (updateData.profileImage) adminToUpdate.profileImage = updateData.profileImage;
  if (updateData.profileImagePublicId) adminToUpdate.profileImagePublicId = updateData.profileImagePublicId;
  await adminToUpdate.save();

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: adminToUpdate._id,
      profileImage: adminToUpdate.profileImage || '',
      fullName: adminToUpdate.fullName,
      email: adminToUpdate.email,
      phone: adminToUpdate.phone || '',
      role: adminToUpdate.role,
      isActive: adminToUpdate.isActive,
      lastLogin: adminToUpdate.lastLogin || null,
      createdAt: adminToUpdate.createdAt,
    },
  });
});

export const removeProfileImage = asyncHandler(async (req, res) => {
  const adminToUpdate = await Admin.findById(req.user._id);

  if (!adminToUpdate.profileImage) {
    throw new ApiError(400, 'No profile image to remove');
  }

  await deleteFromCloudinary(adminToUpdate.profileImagePublicId);

  adminToUpdate.profileImage = '';
  adminToUpdate.profileImagePublicId = '';
  await adminToUpdate.save();

  return res.status(200).json({
    success: true,
    message: 'Profile image removed successfully',
    user: {
      id: adminToUpdate._id,
      profileImage: '',
      fullName: adminToUpdate.fullName,
      email: adminToUpdate.email,
      phone: adminToUpdate.phone || '',
      role: adminToUpdate.role,
      isActive: adminToUpdate.isActive,
      lastLogin: adminToUpdate.lastLogin || null,
      createdAt: adminToUpdate.createdAt,
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const admin = await Admin.findById(req.user._id).select('+password');

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  admin.password = newPassword;
  await admin.save();

  return res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});
