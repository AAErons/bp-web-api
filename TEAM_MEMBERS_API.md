# Team Members API Documentation

Base URL: `https://bp-web-api.vercel.app` (production) or `http://localhost:3001` (development)

## Database Schema

```json
{
  "_id": "ObjectId",
  "id": "String (unique identifier, auto-generated UUID)",
  "name": "String (required)",
  "description": "String (required)",
  "smallImage": "String (required, URL to small image)",
  "fullImage": "String (required, URL to full image)",
  "createdAt": "Date (auto-generated)",
  "updatedAt": "Date (auto-updated)"
}
```

## Endpoints

### 1. GET /api/team-members
**Returns all team members**

**Request:**
```bash
curl -X GET https://bp-web-api.vercel.app/api/team-members
```

**Response (200 OK):**
```json
[
  {
    "_id": "685cff35442e1b2384f218a0",
    "id": "131cbd49-42d4-4050-ab3e-0b5470424ba6",
    "name": "E.V.",
    "description": "Kreisais Krasts biedrs, kurš prot performēt divās valodās...",
    "smallImage": "https://example.com/ev_small.jpg",
    "fullImage": "https://example.com/ev_full.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### 2. GET /api/team-members/:id
**Returns a single team member by ID**

**Request:**
```bash
curl -X GET https://bp-web-api.vercel.app/api/team-members/685cff35442e1b2384f218a0
```

**Response (200 OK):**
```json
{
  "_id": "685cff35442e1b2384f218a0",
  "id": "131cbd49-42d4-4050-ab3e-0b5470424ba6",
  "name": "E.V.",
  "description": "Kreisais Krasts biedrs, kurš prot performēt divās valodās...",
  "smallImage": "https://example.com/ev_small.jpg",
  "fullImage": "https://example.com/ev_full.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Team member not found"
}
```

---

### 3. POST /api/team-members
**Creates a new team member**

**Request:**
```bash
curl -X POST https://bp-web-api.vercel.app/api/team-members \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E.V.",
    "description": "Kreisais Krasts biedrs, kurš prot performēt divās valodās...",
    "smallImage": "https://example.com/ev_small.jpg",
    "fullImage": "https://example.com/ev_full.jpg"
  }'
```

**Response (201 Created):**
```json
{
  "_id": "685cff35442e1b2384f218a0",
  "id": "131cbd49-42d4-4050-ab3e-0b5470424ba6",
  "name": "E.V.",
  "description": "Kreisais Krasts biedrs, kurš prot performēt divās valodās...",
  "smallImage": "https://example.com/ev_small.jpg",
  "fullImage": "https://example.com/ev_full.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Team member name is required"
}
```

---

### 4. PUT /api/team-members/:id
**Updates an existing team member by ID**

**Request:**
```bash
curl -X PUT https://bp-web-api.vercel.app/api/team-members/685cff35442e1b2384f218a0 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E.V. Updated",
    "description": "Updated description for E.V."
  }'
```

**Response (200 OK):**
```json
{
  "_id": "685cff35442e1b2384f218a0",
  "id": "131cbd49-42d4-4050-ab3e-0b5470424ba6",
  "name": "E.V. Updated",
  "description": "Updated description for E.V.",
  "smallImage": "https://example.com/ev_small.jpg",
  "fullImage": "https://example.com/ev_full.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Team member not found"
}
```

---

### 5. DELETE /api/team-members/:id
**Deletes a team member by ID**

**Request:**
```bash
curl -X DELETE https://bp-web-api.vercel.app/api/team-members/685cff35442e1b2384f218a0
```

**Response (200 OK):**
```json
{
  "message": "Team member deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Team member not found"
}
```

---

## JavaScript/Fetch Examples

### Get all team members
```javascript
fetch('https://bp-web-api.vercel.app/api/team-members')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Create a new team member
```javascript
fetch('https://bp-web-api.vercel.app/api/team-members', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'E.V.',
    description: 'Kreisais Krasts biedrs, kurš prot performēt divās valodās...',
    smallImage: 'https://example.com/ev_small.jpg',
    fullImage: 'https://example.com/ev_full.jpg'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Update a team member
```javascript
fetch('https://bp-web-api.vercel.app/api/team-members/685cff35442e1b2384f218a0', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'E.V. Updated',
    description: 'Updated description for E.V.'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Delete a team member
```javascript
fetch('https://bp-web-api.vercel.app/api/team-members/685cff35442e1b2384f218a0', {
  method: 'DELETE'
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

---

## Error Handling

The API returns appropriate HTTP status codes:

- **200 OK**: Successful GET, PUT, DELETE operations
- **201 Created**: Successful POST operation
- **400 Bad Request**: Invalid request data or missing required fields
- **404 Not Found**: Team member not found
- **500 Internal Server Error**: Server error

All error responses include a `message` field with a descriptive error message.

---

## Notes

- The `id` field is automatically generated as a UUID when creating new team members
- `createdAt` and `updatedAt` timestamps are automatically managed
- All endpoints support CORS for cross-origin requests
- The API uses the same MongoDB connection and middleware as the galleries API 