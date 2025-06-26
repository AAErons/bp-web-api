# Piedavajumi Reordering API

This document describes the reordering functionality for the piedavajumi (offers) collection.

## Database Schema

The piedavajumi collection now includes an `order` field:

```javascript
{
  title: String,           // Required
  duration: String,        // Optional
  description: String,     // Required
  additionalTitle: String, // Optional
  additionalDescription: String, // Optional
  image: String,           // Required
  order: Number,           // New field for ordering
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### 1. GET /api/piedavajumi
Returns all piedavajumi sorted by order field (ascending), then by creation date.

**Response:**
```json
[
  {
    "_id": "...",
    "title": "Offer 1",
    "description": "...",
    "image": "...",
    "order": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### 2. POST /api/piedavajumi
Creates a new piedavajums. If no order is provided, it will be assigned to the end of the list.

**Request Body:**
```json
{
  "title": "New Offer",
  "description": "Description",
  "image": "image-url",
  "order": 5  // Optional - will be auto-assigned if not provided
}
```

### 3. PUT /api/piedavajumi/:id
Updates an existing piedavajums, including the order field.

**Request Body:**
```json
{
  "title": "Updated Offer",
  "order": 3  // Optional
}
```

### 4. PUT /api/piedavajumi/reorder
Reorders all piedavajumi based on the provided array of IDs.

**Request Body:**
```json
{
  "sectionIds": ["id1", "id2", "id3", "id4"]
}
```

**Response:**
```json
{
  "message": "Sections reordered successfully"
}
```

## Migration

If you have existing piedavajumi data, run the migration script to add order values:

```bash
npm run migrate:piedavajumi
```

This will assign order values (0, 1, 2, ...) to existing piedavajumi based on their creation date.

## Usage Examples

### Reordering via API
```javascript
// Reorder piedavajumi
const response = await fetch('/api/piedavajumi/reorder', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sectionIds: ['id3', 'id1', 'id2', 'id4']
  })
});
```

### Creating with specific order
```javascript
// Create piedavajums with specific order
const response = await fetch('/api/piedavajumi', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'New Offer',
    description: 'Description',
    image: 'image-url',
    order: 2
  })
});
```

## Error Handling

- **400 Bad Request**: Invalid sectionIds array or missing required fields
- **404 Not Found**: Piedavajums not found (for individual operations)
- **500 Internal Server Error**: Database or server errors

## Notes

- The order field defaults to 0 for new documents
- When creating without specifying order, it's automatically assigned to the end
- The reorder endpoint updates all provided IDs with sequential order values (0, 1, 2, ...)
- GET requests return piedavajumi sorted by order first, then by creation date 