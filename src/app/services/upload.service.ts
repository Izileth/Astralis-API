import cloudinary from '../config/cloudinary';

class UploadService {
  public async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Upload failed, no result from Cloudinary'));
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  }
}

export default new UploadService();
