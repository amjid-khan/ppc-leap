# Multi-Tenant System Flow Documentation

## Current State Analysis

### Backend:
1. **User Model** (`backend/models/User.js`):
   - No `accounts` field
   - Only basic user info (name, email, password, role)

2. **Merchant Service** (`backend/services/merchantService.js`):
   - Hardcoded `merchantId = "5400577233"`
   - No dynamic account selection

3. **Merchant Controller** (`backend/controllers/merchantController.js`):
   - No account context in requests
   - Directly calls merchantService without account info

### Frontend:
1. **Navbar** (`frontend/src/component/Navbar.jsx`):
   - Hardcoded accounts array: `[{ accountName: "PhoneBits.co.uk", merchantId: "540577233" }]`
   - No API call to fetch accounts
   - Selected account stored in local state only

2. **AuthContext** (`frontend/src/context/AuthContext.jsx`):
   - No account management
   - No selected account state
   - User object doesn't include accounts

---

## Multi-Tenant Flow Design

### 1. Database Schema Changes

#### A. Create Account/Merchant Model
**File: `backend/models/Account.js`**
```javascript
{
  accountName: String (required),
  merchantId: String (required, unique),
  userId: ObjectId (ref: User) - which user owns this account,
  isActive: Boolean (default: true),
  createdAt, updatedAt
}
```

#### B. Update User Model
**File: `backend/models/User.js`**
- Add virtual or populate method to get user's accounts
- OR keep accounts as reference array (optional)

---

### 2. Backend API Endpoints

#### A. Account Management Routes
**File: `backend/routes/accountRoutes.js`**
```
GET    /api/accounts              - Get all accounts for logged-in user
POST   /api/accounts              - Add new account (accountName, merchantId)
GET    /api/accounts/:id          - Get single account details
PUT    /api/accounts/:id          - Update account
DELETE /api/accounts/:id          - Delete account
POST   /api/accounts/:id/switch   - Switch to this account (set as active)
```

#### B. Account Controller
**File: `backend/controllers/accountController.js`**
- `getUserAccounts` - Get all accounts for current user
- `addAccount` - Add new account (validate merchantId)
- `updateAccount` - Update account details
- `deleteAccount` - Delete account
- `switchAccount` - Set account as active/selected

#### C. Update Merchant Controller
**File: `backend/controllers/merchantController.js`**
- Get `merchantId` from request (from selected account in session/context)
- Pass `merchantId` to `merchantService.getProducts(merchantId, page, limit, searchQuery)`

#### D. Update Merchant Service
**File: `backend/services/merchantService.js`**
- Change `getProducts` to accept `merchantId` as first parameter
- Remove hardcoded merchantId
- Use dynamic merchantId in all Google API calls

---

### 3. Backend Middleware/Context

#### Option A: Session-based (Recommended)
- Store `selectedAccountId` in user session or JWT token
- Middleware to extract and validate selected account
- Pass merchantId to all merchant-related services

#### Option B: Request Header
- Frontend sends `X-Selected-Account-Id` header
- Middleware extracts and validates
- Pass to services

#### Option C: Context in AuthContext
- Store selected account in AuthContext
- Include in all API requests

---

### 4. Frontend Changes

#### A. Update AuthContext
**File: `frontend/src/context/AuthContext.jsx`**
```javascript
State:
- selectedAccount: null | Account object
- accounts: [] - list of all user accounts

Functions:
- fetchUserAccounts() - Load all accounts from API
- addAccount(accountName, merchantId) - Add new account
- switchAccount(accountId) - Switch to different account
- deleteAccount(accountId) - Delete account
- updateAccount(accountId, data) - Update account
```

#### B. Update Navbar
**File: `frontend/src/component/Navbar.jsx`**
- Remove hardcoded accounts array
- Use `accounts` from AuthContext
- Use `selectedAccount` from AuthContext
- On account switch: call `switchAccount()` from context
- Add "Add Account" button in dropdown (optional)

#### C. Create Account Management Page/Modal
**File: `frontend/src/pages/AccountManagement.jsx` or Modal**
- List all accounts
- Add new account form (accountName, merchantId)
- Edit account
- Delete account
- Switch account button

#### D. Update API Calls
**File: `frontend/src/context/AuthContext.jsx`**
- In `fetchProducts()`, include selected account's merchantId
- OR backend automatically uses selected account from session

---

### 5. Data Flow

#### Adding New Account:
1. User fills form (accountName, merchantId)
2. Frontend calls `POST /api/accounts`
3. Backend validates merchantId (optional: verify with Google API)
4. Backend creates Account document linked to user
5. Frontend updates AuthContext accounts list
6. User can switch to new account

#### Switching Account:
1. User clicks account in dropdown
2. Frontend calls `POST /api/accounts/:id/switch` OR updates local state
3. Backend updates user's selectedAccount (if using session)
4. Frontend updates AuthContext selectedAccount
5. All subsequent API calls use new merchantId
6. Products refresh with new account's data

#### Fetching Products:
1. Frontend calls `GET /api/merchant/products`
2. Backend middleware extracts selectedAccount from session/header
3. Backend gets merchantId from selectedAccount
4. merchantService.getProducts(merchantId, ...) called
5. Google API called with dynamic merchantId
6. Products returned for selected account

---

### 6. Implementation Steps

#### Phase 1: Backend Foundation
1. ✅ Create Account model
2. ✅ Create accountRoutes
3. ✅ Create accountController
4. ✅ Update merchantService to accept merchantId parameter
5. ✅ Update merchantController to get merchantId from request
6. ✅ Add middleware to handle selected account

#### Phase 2: Frontend Integration
1. ✅ Update AuthContext with account management
2. ✅ Update Navbar to use AuthContext accounts
3. ✅ Create account management UI
4. ✅ Update API calls to include account context

#### Phase 3: Testing & Refinement
1. ✅ Test adding accounts
2. ✅ Test switching accounts
3. ✅ Test product fetching with different accounts
4. ✅ Handle edge cases (no accounts, invalid merchantId, etc.)

---

### 7. Important Considerations

#### Security:
- Validate user owns account before allowing operations
- Verify merchantId format
- Optional: Verify merchantId with Google API on add

#### Performance:
- Cache products per account (separate cache per merchantId)
- Clear cache on account switch

#### User Experience:
- Show loading state during account switch
- Auto-select first account if none selected
- Prevent deleting last account
- Show account name/merchantId in UI

#### Error Handling:
- Handle invalid merchantId
- Handle Google API errors per account
- Handle account not found scenarios

---

### 8. Example API Request Flow

```
User Action: Switch to Account "ABC Store" (merchantId: "123456")

1. Frontend: 
   - User clicks "ABC Store" in dropdown
   - Call: POST /api/accounts/accountId123/switch
   - Update AuthContext: setSelectedAccount(accountId123)

2. Backend:
   - Middleware: Extract accountId from request
   - Verify: User owns this account
   - Update: User's selectedAccount = accountId123
   - Response: { success: true, account: {...} }

3. Frontend:
   - Refresh products: fetchProducts()
   - Call: GET /api/merchant/products

4. Backend:
   - Middleware: Get selectedAccount from user session
   - merchantController: Extract merchantId = "123456"
   - merchantService.getProducts("123456", page, limit, search)
   - Google API: content.products.list({ merchantId: "123456" })
   - Response: Products for account "ABC Store"
```

---

## Summary

**Key Changes Needed:**
1. **Database**: Account model with user relationship
2. **Backend APIs**: CRUD for accounts + switch endpoint
3. **Merchant Service**: Dynamic merchantId instead of hardcoded
4. **Frontend Context**: Account state management
5. **Navbar**: Use real accounts from API
6. **Account Management UI**: Add/edit/delete accounts

**Flow:**
User → Add Accounts → Switch Account → Products Load for Selected Account

**Data Storage:**
- Accounts in MongoDB (Account collection)
- Selected account in session/JWT or frontend state
- Products cached per merchantId

