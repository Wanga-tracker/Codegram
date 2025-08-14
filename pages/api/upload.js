import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import formidable from "formidable";
import fs from "fs";

// Disable Next.js default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse form-data request
    const form = formidable({ multiples: false });
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Create S3 client
    const s3 = new S3Client({
      region: process.env.SUPABASE_S3_REGION,
      endpoint: process.env.SUPABASE_S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY,
        secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY,
      },
      forcePathStyle: true, // Supabase S3 compatibility
    });

    // Read file into buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // Create a unique file name
    const fileName = `${Date.now()}-${file.originalFilename}`;

    // Upload to S3 bucket (example: bot-image or bot-zip)
    const bucket = fields.bucket || "bot-image"; // Default to "bot-image"
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: fileBuffer,
        ContentType: file.mimetype,
      })
    );

    // Return public file URL
    const fileUrl = `${process.env.SUPABASE_S3_ENDPOINT}/${bucket}/${fileName}`;
    return res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: error.message });
  }
}
