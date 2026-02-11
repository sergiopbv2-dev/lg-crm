# Stage & Deletion Workflow Implementation Plan

## 1. Database Schema Updates
- **Table**: `quotes`
    - Add `stage` (Text) - Enum-like: 'Registration', 'Access', 'Spec/In', 'Award', 'Closed', 'Lost'
    - Add `loss_reason` (Text) - Reason for loss or deletion request.
    - Add `status` (Text) - Update existing usage or refine. Current values: 'draft', 'sent', 'approved'.
    - New potential statuses: 'Active', 'Lost', 'Closed', 'Delete_Pending'.

## 2. Default Values
- New quotes start at **Registration**.
- Mapping existing quotes to 'Registration' if null.

## 3. Frontend - Quote List (`quotes.html`)
- **Display Stage**: Add a column or badge showing the current stage.
- **Action Buttons**:
    - **Delete Button**: Replace with "Solicitar Eliminación" (Request Deletion).
    - **Lost Button**: "Marcar como Perdida" (Mark as Lost).
    - **Advance Stage**: Ability to move between stages manually (e.g., Dropdown).

## 4. Deletion/Loss Workflow
- **User Action**: Click "Solicitar Eliminación" or "Marcar Perdida".
- **Logic**:
    - Prompt for reason (Modal).
    - Update `stage` to 'Delete_Pending' (for deletion) or 'Lost_Pending' (if approval needed for lost, user said "pase a perdida" after approval).
    - Actually, user said: "etapa de Borrar la oportunidad ... que eso se vaya a mi como aprobador".
    - So: Status -> 'Approval_Pending'. Reason -> 'User input'.
- **Admin Action**:
    - Admin sees pending requests (Filter in List).
    - Admin clicks "Aprobar" -> Stage becomes 'Lost' (as per user request "pase a perdida").
    - Admin clicks "Rechazar" -> Revert to previous stage.

## 5. Stages Logic
- **Registration**: Initial stage.
- **Access**: Contact made / Access granted.
- **Spec/In**: LG Specs included.
- **Award**: Project Awarded.
- **Closed**: Finalized (Won).
- **Lost**: Project Lost / Cancelled.

## 6. Implementation Steps
1.  **SQL Migration**: Add columns.
2.  **UI Updates**: Modify Status column to Stage dropdown.
3.  **Delete Logic**: Implement request workflow.
4.  **Admin Approval**: Implement approval functions.
