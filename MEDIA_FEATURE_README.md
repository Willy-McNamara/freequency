# Media Upload Feature

## Overview

The Media Upload feature allows users to add photos, audio recordings, and videos to their practice sessions. This feature is currently in Phase 1 implementation, focusing on photo uploads with audio and video support planned for future phases.

## Current Implementation (Phase 1)

### Features

- **Photo Upload**: Users can upload images (JPEG, PNG, GIF, WebP) up to 10MB
- **Media Gallery**: Display uploaded media with preview functionality
- **Media Management**: Add and remove media from sessions
- **Session Integration**: Media is saved with sessions and persists across browser sessions

### File Type Support

- **Images**: JPEG, JPG, PNG, GIF, WebP (10MB max)
- **Audio**: MP3, WAV, M4A, OGG, WebM (50MB max) - _Coming in Phase 2_
- **Video**: MP4, WebM, OGG, MOV (100MB max) - _Coming in Phase 3_

### Technical Implementation

#### Backend

- **S3 Service**: Enhanced to support multiple file types with size validation
- **Media Service**: Handles media item creation and session association
- **API Endpoints**:
  - `POST /sessions/signed-url`: Get S3 signed URL for direct upload
  - `POST /sessions/connect-media`: Associate uploaded media with session

#### Frontend

- **MediaUploadButton**: Generic upload component with file validation
- **MediaGallery**: Display component with preview and removal functionality
- **SessionContext**: Extended to include media state management
- **Practice Page**: Integrated media section between Tags and Save button

### User Experience

1. User clicks "Add Media" button in the Media section
2. File picker opens with appropriate file type filters
3. File is validated for type and size
4. File is uploaded directly to S3 via signed URL
5. Media is added to session and displayed in gallery
6. User can remove media items before saving session

## File Size Limits

| Media Type | Max Size | Approximate Duration |
| ---------- | -------- | -------------------- |
| Images     | 10MB     | N/A                  |
| Audio      | 50MB     | 5-10 minutes         |
| Video      | 100MB    | 2-5 minutes          |

## Future Phases

### Phase 2: Audio Recording (Planned)

- Live audio recording using MediaRecorder API
- Audio playback in gallery
- Audio file processing and optimization

### Phase 3: Video Support (Planned)

- Video upload functionality
- Video playback in gallery
- Video compression and optimization

## Technical Notes

### S3 Storage

- Files are stored in `media/{musicianId}/{timestamp}.{extension}` format
- Signed URLs expire after 60 seconds
- File metadata includes musician ID and file category

### Security

- File type validation on both frontend and backend
- File size limits enforced
- Authentication required for all media operations

### Performance

- Direct S3 uploads reduce server load
- Media previews are optimized for gallery display
- Audio/video playback uses native browser controls

## Usage

### Adding Media to Session

1. Navigate to Practice page
2. Scroll to Media section (between Tags and Save button)
3. Click "Add Media" button
4. Select file from device
5. File uploads automatically and appears in gallery

### Removing Media

1. Click the "X" button on any media item in the gallery
2. Media is removed from session immediately

### Saving Session with Media

1. Media is automatically included when saving session
2. Media persists with session data
3. Media is cleared when session is reset or deleted

## Development

### Adding New File Types

1. Update `acceptedFileTypes` in `S3Service`
2. Update `MediaUploadButton` component
3. Update file validation logic
4. Test with various file formats

### Customizing Media Display

1. Modify `MediaGallery` component
2. Update preview rendering logic
3. Add custom controls for specific media types

## Troubleshooting

### Common Issues

- **File too large**: Check file size limits
- **Unsupported file type**: Verify file extension is supported
- **Upload fails**: Check S3 credentials and permissions
- **Media not displaying**: Verify S3 bucket configuration

### Debug Steps

1. Check browser console for errors
2. Verify network requests in DevTools
3. Check S3 bucket permissions
4. Validate file format and size
