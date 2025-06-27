# Cloudinary Integration Documentation

This document describes the complete Cloudinary integration for the gallery management system.

## Overview

The backend is fully configured to work with Cloudinary for image storage and management. All image uploads go directly to Cloudinary, and the system stores both Cloudinary URLs and metadata for optimal performance and management.

## Database Schema

### GalleryImage Model
```javascript
{
  gallery: ObjectId,           // Reference to Gallery (optional)
  cloudinaryId: String,        // Cloudinary public_id (required)
  imageUrl: String,            // Cloudinary secure_url (required)
  cloudinaryData: {            // Additional Cloudinary metadata
    public_id: String,
    format: String,
    width: Number,
    height: Number,
    bytes: Number,
    resource_type: String,
    created_at: String,
    etag: String
  },
  caption: String,             // Optional image caption
  order: Number,               // For ordering within gallery
  uploadedAt: Date             // Upload timestamp
}
```

### Gallery Model
```javascript
{
  name: String,                // Gallery name (required)
  eventDate: Date,             // Optional event date
  coverImage: String,          // Cloudinary URL for cover image
  coverImageId: String,        // Cloudinary public_id for cover image
  images: [{                   // Array of image references
    image: ObjectId,           // Reference to GalleryImage
    titleImage: Boolean        // Whether this is the title image
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Image Upload Endpoints

#### 1. POST /api/images
Upload an image without associating it to a gallery.

**Request:**
```bash
POST /api/images
Content-Type: multipart/form-data

imageFile: [file]
caption: "Image caption" (optional)
order: 0 (optional)
```

**Response:**
```json
{
  "_id": "...",
  "cloudinaryId": "gallery_images/abc123",
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/gallery_images/abc123.jpg",
  "cloudinaryData": {
    "public_id": "gallery_images/abc123",
    "format": "jpg",
    "width": 1920,
    "height": 1080,
    "bytes": 245760,
    "resource_type": "image",
    "created_at": "2024-01-01T00:00:00Z",
    "etag": "abc123def456"
  },
  "caption": "Image caption",
  "order": 0,
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2. POST /api/images/gallery/:galleryId
Upload an image directly to a specific gallery.

**Request:**
```bash
POST /api/images/gallery/64a1b2c3d4e5f6789012345
Content-Type: multipart/form-data

imageFile: [file]
caption: "Image caption" (optional)
order: 0 (optional)
titleImage: true (optional)
```

**Response:** Same as above, but with `gallery` field populated.

### Gallery Management Endpoints

#### 1. POST /api/galleries
Create a new gallery with Cloudinary cover image.

**Request:**
```json
{
  "name": "My Gallery",
  "coverImage": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/galleries/cover.jpg",
  "coverImageId": "galleries/cover",
  "eventDate": "2024-01-01T00:00:00Z",
  "images": [
    {
      "id": "64a1b2c3d4e5f6789012345",
      "titleImage": true
    }
  ]
}
```

#### 2. GET /api/galleries
Get all galleries with populated image data including Cloudinary information.

**Response:**
```json
[
  {
    "_id": "...",
    "name": "My Gallery",
    "coverImage": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/galleries/cover.jpg",
    "coverImageId": "galleries/cover",
    "images": [
      {
        "id": "64a1b2c3d4e5f6789012345",
        "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/gallery_images/abc123.jpg",
        "cloudinaryId": "gallery_images/abc123",
        "title": "Image caption",
        "description": "Image caption",
        "uploadedAt": "2024-01-01T00:00:00.000Z",
        "cloudinaryData": {
          "public_id": "gallery_images/abc123",
          "format": "jpg",
          "width": 1920,
          "height": 1080,
          "bytes": 245760,
          "resource_type": "image",
          "created_at": "2024-01-01T00:00:00Z",
          "etag": "abc123def456"
        },
        "titleImage": true
      }
    ]
  }
]
```

## Cloudinary Configuration

### Environment Variables
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Storage Configuration
Images are stored in Cloudinary with the following structure:
- **General images**: `gallery_images/`
- **Gallery-specific images**: `galleries/{galleryId}/`

### File Upload Limits
- Maximum file size: 20MB
- Supported formats: All image formats supported by Cloudinary
- Automatic format conversion to JPG

## Key Features

### 1. **Automatic Cloudinary Integration**
- All image uploads go directly to Cloudinary
- Automatic folder organization
- Metadata extraction and storage

### 2. **Dual Storage Strategy**
- **cloudinaryId**: For Cloudinary operations (deletion, transformations)
- **imageUrl**: For direct access and display
- **cloudinaryData**: For additional metadata and analytics

### 3. **Error Handling**
- Automatic cleanup of Cloudinary files if database operations fail
- Comprehensive error logging
- Graceful handling of Cloudinary API errors

### 4. **Gallery Management**
- Support for cover images with Cloudinary URLs
- Title image functionality
- Image ordering within galleries

### 5. **Performance Optimizations**
- Cloudinary URLs for fast image delivery
- CDN integration through Cloudinary
- Automatic image transformations available

## Usage Examples

### Upload Image to Gallery
```javascript
const formData = new FormData();
formData.append('imageFile', file);
formData.append('caption', 'My image caption');
formData.append('titleImage', 'true');

const response = await fetch('/api/images/gallery/64a1b2c3d4e5f6789012345', {
  method: 'POST',
  body: formData
});
```

### Create Gallery with Cloudinary Cover
```javascript
const response = await fetch('/api/galleries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Gallery',
    coverImage: 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/galleries/cover.jpg',
    coverImageId: 'galleries/cover',
    images: [
      {
        id: '64a1b2c3d4e5f6789012345',
        titleImage: true
      }
    ]
  })
});
```

### Delete Image (Automatic Cloudinary Cleanup)
```javascript
const response = await fetch('/api/images/64a1b2c3d4e5f6789012345', {
  method: 'DELETE'
});
// Automatically deletes from both MongoDB and Cloudinary
```

## Best Practices

1. **Always use cloudinaryId for Cloudinary operations**
2. **Use imageUrl for display purposes**
3. **Store coverImageId for easier cover image management**
4. **Handle Cloudinary errors gracefully**
5. **Use appropriate folder structures for organization**

## Error Handling

The system handles various error scenarios:
- **Upload failures**: Automatic Cloudinary cleanup
- **Gallery not found**: Cleanup of uploaded files
- **Database errors**: Rollback of Cloudinary uploads
- **Invalid file types**: Rejection before upload

## Security Considerations

- File size limits prevent abuse
- File type validation through Cloudinary
- Secure URLs for all Cloudinary resources
- Environment variable protection for API keys 