# Migration to Google Sheets Implementation Plan

The user wants to replace Supabase with Google Sheets for storing attendee data.

## 1. Google Sheets Setup
User needs to:
- Create a Google Sheet.
- Columns: `id`, `name`, `face_photo_url`, `is_winner`, `created_at`, `position_x`, `position_y`.
- Deploy a Google Apps Script as a Web App to act as a REST API.

## 2. Google Apps Script Code
I will provide a script that handles `GET`, `POST` (Insert), `PUT` (Update), and `DELETE`.

## 3. Frontend Utility
Create `src/lib/googleSheets.ts` to manage communication with the deployed Web App URL.

## 4. Update Main Pages
- Modify `src/pages/Index.tsx` to use `googleSheets.ts` for all attendee-related operations.
- Update `fetchAttendees`, `handleRegister`, `handleDeleteAttendee`, `handleUpdateAttendee`, `handleWinnerSelected`, and `handleResetWinners`.

## 5. Storage
Keep Supabase Storage for face photos as Google Sheets cannot store binary data easily. Or use Base64 if small, but Supabase Storage is better performance-wise. The user only asked to move the "list database".
