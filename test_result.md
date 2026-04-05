# PlacementPrep Testing Protocol

## Testing Protocol
- Test backend APIs using curl with authentication
- Test frontend flows using playwright automation
- Report all issues found with priority (HIGH/MEDIUM/LOW)
- Verify fixes before marking as complete

## Current Testing Status

### Iteration 1 - Initial Testing (Current)

**Features to Test:**
1. Light/Dark Mode Theme Switching
   - Toggle between themes on Dashboard, Aptitude, Reasoning, all auth pages
   - Verify background colors change properly
   - Verify text remains readable in both modes

2. Questions Flow (P0 - CRITICAL)
   - Aptitude Module: Practice Mode (10 questions), Test Mode (20 questions)
   - Reasoning Module: Practice Mode (10 questions), Test Mode (20 questions)
   - Verify questions are unique and randomized
   - Verify no premature ending
   - Test all three categories: Quantitative, Logical, Verbal (Aptitude) and Pattern, Analytical, Visual (Reasoning)

3. Password Reset Flow (P1)
   - Test forgot password endpoint
   - Verify reset token generation
   - Since no SMTP is configured, verify token is logged or shown in response

4. Interview Module WebSocket (P1)
   - Test interview start flow
   - Verify WebSocket connection establishes
   - Test basic interview interaction

5. Authentication
   - Login/Signup flows
   - Token validation
   - Protected route access

**Test Credentials:**
- Email: test@example.com
- Password: Test@123

## Incorporate User Feedback
- User reported: "Questions end at 3-4 instead of 10/20" → FIXED in backend and frontend
- User reported: "Light/dark mode only changes text, not background" → FIXED with CSS variables
- User reported: "Password reset email not received" → Need to mock/log token output

## Known Issues
- WebSocket connection attempts on port 443 (non-critical)
- Glass card background has slight greenish tint - needs refinement

## Next Steps
1. Run comprehensive tests via testing subagent
2. Fix all HIGH priority issues
3. Fix MEDIUM priority issues
4. Implement remaining features (file upload, product tour, onboarding)
