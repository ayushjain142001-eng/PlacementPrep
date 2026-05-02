# PlacementPrep Testing Protocol

## Testing Protocol
- Test backend APIs using curl with authentication
- Test frontend flows using playwright automation
- Report all issues found with priority (HIGH/MEDIUM/LOW)
- Verify fixes before marking as complete

## Current Testing Status

### Iteration 2 - New Features Testing (Current)

**Features to Test:**
1. File Upload - Profile Picture
   - Upload image file (JPEG, PNG, WEBP)
   - Verify file size validation (max 5MB)
   - Verify image displays on profile page
   - Verify image persists after refresh

2. File Upload - Resume
   - Upload PDF/DOC file
   - Verify file size validation (max 10MB)
   - Verify resume info shows on profile page
   - Verify download link works

3. Interactive Product Tour
   - Tour starts automatically on first dashboard visit
   - Tour highlights key navigation elements
   - Tour can be skipped
   - Tour doesn't show again after completion

4. Previously Fixed Features (Regression Testing)
   - Light/Dark mode switching
   - Questions flow (10 for practice, 20 for test)
   - Password reset with dev link

**Test Credentials:**
- Email: test@example.com
- Password: Test@123

## Incorporate User Feedback
- User requested: "Continue with all tasks" - Implemented file upload, product tour
- All P0 and P1 issues from Iteration 1 are resolved

## Known Issues
- Glass card greenish tint (cosmetic, LOW priority)
- WebSocket warning on port 443 (non-blocking)

## Next Steps
1. Test new file upload functionality
2. Test product tour on first login
3. Regression test previous fixes
4. Smart onboarding enhancement
