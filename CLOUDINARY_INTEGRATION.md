# Cloudinary Integration Documentation

This document describes the complete Cloudinary integration for the gallery management system.

## Overview

The backend is fully configured to work with Cloudinary for image storage and management. All image uploads go directly to Cloudinary, and the system stores both Cloudinary URLs and metadata for optimal performance and management.

**NEW: Direct Cloudinary URL Support**
The backend now supports creating galleries directly with Cloudinary URLs, automatically creating GalleryImage documents from the URLs.

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

### Gallery Creation with Cloudinary URLs

#### POST /api/galleries
Create a new gallery with Cloudinary URLs directly.

**Request with Cloudinary URLs:**
```json
{
  "name": "My Gallery",
  "eventDate": "2025-03-14",
  "images": [
    "https://res.cloudinary.com/dqgrzx5yt/image/upload/v1751020658/dmwco79w9n9gxqlymc3o.jpg",
    "https://res.cloudinary.com/dqgrzx5yt/image/upload/v1751020660/e8l21btqkegiuszyxsm3.jpg",
    "https://res.cloudinary.com/dqgrzx5yt/image/upload/v1751020663/an0ot2bghve8kywevnp6.jpg"
  ]
}
```

**Request with Object format:**
```json
{
  "name": "My Gallery",
  "eventDate": "2025-03-14",
  "images": [
    {
      "url": "https://res.cloudinary.com/dqgrzx5yt/image/upload/v1751020658/dmwco79w9n9gxqlymc3o.jpg",
      "caption": "First image",
      "titleImage": true
    },
    {
      "url": "https://res.cloudinary.com/dqgrzx5yt/image/upload/v1751020660/e8l21btqkegiuszyxsm3.jpg",
      "caption": "Second image"
    }
  ]
}
```

**Response:**
```json
{
  "_id": "...",
  "name": "My Gallery",
  "eventDate": "2025-03-14T00:00:00.000Z",
  "images": [
    {
      "id": "...",
      "url": "https://res.cloudinary.com/dqgrzx5yt/image/upload/v1751020658/dmwco79w9n9gxqlymc3o.jpg",
      "cloudinaryId": "dmwco79w9n9gxqlymc3o",
      "title": "First image",
      "description": "First image",
      "uploadedAt": "2024-01-01T00:00:00.000Z",
      "cloudinaryData": {
        "public_id": "dmwco79w9n9gxqlymc3o",
        "format": "jpg",
        "resource_type": "image"
      },
      "titleImage": true
    }
  ]
}
```

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

### Gallery Management Endpoints

#### 1. GET /api/galleries
Get all galleries with populated image data including Cloudinary information.

#### 2. PUT /api/galleries/:id
Update a gallery, supporting both Cloudinary URLs and ObjectIds.

## Cloudinary URL Processing

### Automatic Cloudinary ID Extraction
The backend automatically extracts Cloudinary IDs from URLs:

**Input URL:**
```
https://res.cloudinary.com/dqgrzx5yt/image/upload/v1751020658/dmwco79w9n9gxqlymc3o.jpg
```

**Extracted ID:**
```
dmwco79w9n9gxqlymc3o
```

### Supported URL Formats
- Standard Cloudinary URLs: `https://res.cloudinary.com/cloud_name/image/upload/v1234567890/filename.jpg`
- URLs with folders: `https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg`
- URLs with transformations: `https://res.cloudinary.com/cloud_name/image/upload/c_fill,w_1000/v1234567890/filename.jpg`

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

### 1. **Direct Cloudinary URL Support**
- Create galleries directly with Cloudinary URLs
- Automatic GalleryImage document creation
- Cloudinary ID extraction from URLs
- Support for both string URLs and object format

### 2. **Automatic Cloudinary Integration**
- All image uploads go directly to Cloudinary
- Automatic folder organization
- Metadata extraction and storage

### 3. **Dual Storage Strategy**
- **cloudinaryId**: For Cloudinary operations (deletion, transformations)
- **imageUrl**: For direct access and display
- **cloudinaryData**: For additional metadata and analytics

### 4. **Error Handling**
- Automatic cleanup of Cloudinary files if database operations fail
- Comprehensive error logging
- Graceful handling of Cloudinary API errors
- Validation of Cloudinary URLs

### 5. **Gallery Management**
- Support for cover images with Cloudinary URLs
- Title image functionality
- Image ordering within galleries
- Mixed support for URLs and ObjectIds

### 6. **Performance Optimizations**
- Cloudinary URLs for fast image delivery
- CDN integration through Cloudinary
- Automatic image transformations available

## Usage Examples

### Create Gallery with Cloudinary URLs
```javascript
const response = await fetch('/api/galleries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Gallery',
    eventDate: '2025-03-14',
    images: [
      'https://res.cloudinary.com/dqgrzx5yt/image/upload/v1751020658/dmwco79w9n9gxqlymc3o.jpg',
      'https://res.cloudinary.com/dqgrzx5yt/image/upload/v1751020660/e8l21btqkegiuszyxsm3.jpg'
    ]
  })
});
```

### Create Gallery with Object Format
```javascript
const response = await fetch('/api/galleries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Gallery',
    images: [
      {
        url: 'https://res.cloudinary.com/dqgrzx5yt/image/upload/v1751020658/dmwco79w9n9gxqlymc3o.jpg',
        caption: 'First image',
        titleImage: true
      }
    ]
  })
});
```

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

### Delete Image (Automatic Cloudinary Cleanup)
```javascript
const response = await fetch('/api/images/64a1b2c3d4e5f6789012345', {
  method: 'DELETE'
});
// Automatically deletes from both MongoDB and Cloudinary
```

## Best Practices

1. **Use Cloudinary URLs directly** for quick gallery creation
2. **Always use cloudinaryId for Cloudinary operations**
3. **Use imageUrl for display purposes**
4. **Store coverImageId for easier cover image management**
5. **Handle Cloudinary errors gracefully**
6. **Use appropriate folder structures for organization**

## Error Handling

The system handles various error scenarios:
- **Invalid Cloudinary URLs**: Proper error messages for malformed URLs
- **Upload failures**: Automatic Cloudinary cleanup
- **Gallery not found**: Cleanup of uploaded files
- **Database errors**: Rollback of Cloudinary uploads
- **Invalid file types**: Rejection before upload

## Security Considerations

- File size limits prevent abuse
- File type validation through Cloudinary
- Secure URLs for all Cloudinary resources
- Environment variable protection for API keys
- URL validation for Cloudinary URLs 