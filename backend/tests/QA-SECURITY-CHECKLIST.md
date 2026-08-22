# Security Hardening - QA Manual Testing Checklist

## Prerequisites
- [ ] Backend server running with new `.env` secrets
- [ ] MongoDB running
- [ ] Postman or similar API testing tool ready
- [ ] Test files prepared (valid images, malicious files)

---

## Test 1: JWT Secret Strength ✅ (Automated)

**Run automated test:**
```bash
npm test -- tests/security/jwt.test.js
```

**Expected Result:** All tests pass
- JWT_SECRET is 64+ characters
- Contains uppercase, lowercase, numbers, symbols
- JWT_REFRESH_SECRET is different and equally strong

---

## Test 2: Expired Token Rejection

**Setup:**
1. Create an order and upload a receipt
2. Get the order ID and approval token from database
3. In MongoDB, manually expire the token:
   ```javascript
   db.orders.updateOne(
     { _id: ObjectId("ORDER_ID_HERE") },
     { $set: { approvalTokenExpires: new Date('2024-01-01') } }
   )
   ```

**Test:**
```bash
GET http://localhost:3000/api/orders/{ORDER_ID}/approve?token={TOKEN}
```

**Expected Result:**
- Status: `403 Forbidden`
- Response: `{ "error": "Approval token expired" }`
- Log entry created for failed attempt

**Status:** ⬜ Not Tested

---

## Test 3: Double Approval Prevention

**Setup:**
1. Create an order and upload a receipt
2. Get the approval link from email or database

**Test:**
```bash
# First approval
GET http://localhost:3000/api/orders/{ORDER_ID}/approve?token={TOKEN}

# Second approval (same link)
GET http://localhost:3000/api/orders/{ORDER_ID}/approve?token={TOKEN}
```

**Expected Results:**
- First request: `200 OK` with `{ "success": true, "message": "Order approved successfully..." }`
- Second request: `200 OK` with `{ "message": "Order already approved" }`
- In database: `approvalToken` and `approvalTokenExpires` fields should be **completely removed** (not null)

**Verification Query:**
```javascript
db.orders.findOne({ _id: ObjectId("ORDER_ID") })
// Should NOT have approvalToken or approvalTokenExpires fields
```

**Status:** ⬜ Not Tested

---

## Test 4: Duplicate Receipt Upload

**Setup:**
1. Create an order via API or frontend
2. Prepare a valid test image (JPEG/PNG)

**Test:**
```bash
# First upload
POST http://localhost:3000/api/orders/{ORDER_ID}/receipt
Content-Type: multipart/form-data
Body: receipt=@test-receipt.jpg

# Second upload (same order)
POST http://localhost:3000/api/orders/{ORDER_ID}/receipt
Content-Type: multipart/form-data
Body: receipt=@test-receipt2.jpg
```

**Expected Results:**
- First upload: `200 OK` with success message
- Second upload: `400 Bad Request` with `{ "error": "Receipt already submitted or order approved" }`

**Status:** ⬜ Not Tested

---

## Test 5: Malicious File Type Rejection

### Test 5a: Direct .php Upload

**Setup:**
1. Create a malicious PHP file:
   ```bash
   echo "<?php system('ls'); ?>" > malicious.php
   ```

**Test:**
```bash
POST http://localhost:3000/api/orders/{ORDER_ID}/receipt
Content-Type: multipart/form-data
Body: receipt=@malicious.php
```

**Expected Result:**
- Status: `400 Bad Request`
- Response: `{ "error": "Invalid file extension. Executable files are not allowed." }`

**Status:** ⬜ Not Tested

---

### Test 5b: Renamed .php to .jpg (Magic Byte Check)

**Setup:**
1. Create PHP file and rename:
   ```bash
   echo "<?php system('ls'); ?>" > malicious.jpg
   ```

**Test:**
```bash
POST http://localhost:3000/api/orders/{ORDER_ID}/receipt
Content-Type: multipart/form-data
Body: receipt=@malicious.jpg
```

**Expected Result:**
- Status: `400 Bad Request`
- Response: `{ "error": "Only images (JPEG, PNG) and PDFs are allowed!" }`
- File should be rejected due to magic byte mismatch (PHP content != JPEG signature)

**Status:** ⬜ Not Tested

---

### Test 5c: Other Dangerous Extensions

**Test with:**
- `.exe` file
- `.sh` file
- `.bat` file
- `.html` file

**Expected Result:** All rejected with `400 Bad Request`

**Status:** ⬜ Not Tested

---

## Test 6: Rate Limit Enforcement (Upload)

**Setup:**
1. Create 6 different orders
2. Prepare a valid test image

**Test:**
```bash
# Upload receipts to 5 orders rapidly
POST http://localhost:3000/api/orders/{ORDER_1}/receipt (receipt=@test.jpg)
POST http://localhost:3000/api/orders/{ORDER_2}/receipt (receipt=@test.jpg)
POST http://localhost:3000/api/orders/{ORDER_3}/receipt (receipt=@test.jpg)
POST http://localhost:3000/api/orders/{ORDER_4}/receipt (receipt=@test.jpg)
POST http://localhost:3000/api/orders/{ORDER_5}/receipt (receipt=@test.jpg)

# 6th upload within 15 minutes
POST http://localhost:3000/api/orders/{ORDER_6}/receipt (receipt=@test.jpg)
```

**Expected Results:**
- First 5 uploads: `200 OK`
- 6th upload: `429 Too Many Requests` with `{ "error": "Too many uploads from this IP, please try again later." }`

**Status:** ⬜ Not Tested

---

## Test 7: Rate Limit Enforcement (Approval)

**Setup:**
1. Create an order with approval token
2. Note the approval URL

**Test:**
```bash
# Attempt approval 11 times with wrong token
for i in {1..11}; do
  curl "http://localhost:3000/api/orders/{ORDER_ID}/approve?token=wrong-token-$i"
done
```

**Expected Results:**
- First 10 attempts: `403 Forbidden` (invalid token)
- 11th attempt: `429 Too Many Requests` with `{ "error": "Too many approval attempts, please try again later." }`

**Status:** ⬜ Not Tested

---

## Test 8: Private File Access Control

### Test 8a: Direct URL Access (Should Fail)

**Setup:**
1. Upload a receipt and note the file path (e.g., `uploads/1234567890-receipt.jpg`)

**Test:**
```bash
# Try to access file directly via static URL
GET http://localhost:3000/uploads/1234567890-receipt.jpg
```

**Expected Result:**
- Status: `404 Not Found` (no static route configured)

**Status:** ⬜ Not Tested

---

### Test 8b: API Access Without Authentication

**Test:**
```bash
GET http://localhost:3000/api/orders/{ORDER_ID}/receipt
# No Authorization header
```

**Expected Result:**
- Status: `401 Unauthorized`
- Response: `{ "error": "Not authorized" }` or similar

**Status:** ⬜ Not Tested

---

### Test 8c: API Access as Wrong User

**Setup:**
1. Create two users (User A and User B)
2. User A creates an order and uploads receipt
3. Get JWT token for User B

**Test:**
```bash
GET http://localhost:3000/api/orders/{ORDER_A_ID}/receipt
Authorization: Bearer {USER_B_TOKEN}
```

**Expected Result:**
- Status: `403 Forbidden`
- Response: `{ "error": "Not authorized to access this receipt" }`
- Security log entry created

**Status:** ⬜ Not Tested

---

### Test 8d: API Access as Order Owner (Should Succeed)

**Setup:**
1. Create order as User A and upload receipt
2. Get JWT token for User A

**Test:**
```bash
GET http://localhost:3000/api/orders/{ORDER_ID}/receipt
Authorization: Bearer {USER_A_TOKEN}
```

**Expected Result:**
- Status: `200 OK`
- Response: File download with proper `Content-Disposition` header
- File should be the uploaded receipt

**Status:** ⬜ Not Tested

---

### Test 8e: API Access as Admin (Should Succeed)

**Setup:**
1. Create order as regular user
2. Get JWT token for admin user

**Test:**
```bash
GET http://localhost:3000/api/orders/{ORDER_ID}/receipt
Authorization: Bearer {ADMIN_TOKEN}
```

**Expected Result:**
- Status: `200 OK`
- Response: File download
- Admin should be able to access any receipt

**Status:** ⬜ Not Tested

---

## Test 9: File Permissions Check

**Setup:**
1. Upload a receipt
2. SSH/access the server filesystem

**Test:**
```bash
ls -la uploads/
```

**Expected Result:**
- All uploaded files should have permissions `600` (rw-------)
- Only the server process owner can read/write
- No group or world access

**Example:**
```
-rw------- 1 www-data www-data 12345 Nov 27 16:00 1234567890-receipt.jpg
```

**Status:** ⬜ Not Tested

---

## Test 10: Token Cleanup Verification

**Setup:**
1. Create order and upload receipt
2. Note the approval token from database
3. Approve the order

**Verification:**
```javascript
// Before approval
db.orders.findOne({ _id: ObjectId("ORDER_ID") })
// Should have: approvalToken, approvalTokenExpires

// After approval
db.orders.findOne({ _id: ObjectId("ORDER_ID") })
// Should NOT have: approvalToken, approvalTokenExpires
// Should have: isApproved: true, approvalLog: {...}
```

**Expected Result:**
- Fields `approvalToken` and `approvalTokenExpires` should be **completely removed** from document
- Not just set to `null` or `undefined`
- `approvalLog` should contain IP, userAgent, and timestamp

**Status:** ⬜ Not Tested

---

## Automated Test Suite

**Run all automated tests:**
```bash
# JWT strength tests
npm test -- tests/security/jwt.test.js

# Payment security integration tests
npm test -- tests/integration/payment-security.test.js
```

**Expected Results:**
- All JWT tests pass (7 tests)
- All payment security tests pass (10+ tests)
- No errors or warnings

**Status:** ⬜ Not Run

---

## Summary Checklist

- [ ] Test 1: JWT Secret Strength (Automated) ✅
- [ ] Test 2: Expired Token Rejection
- [ ] Test 3: Double Approval Prevention
- [ ] Test 4: Duplicate Receipt Upload
- [ ] Test 5a: Direct .php Upload Rejection
- [ ] Test 5b: Renamed .php Magic Byte Check
- [ ] Test 5c: Other Dangerous Extensions
- [ ] Test 6: Upload Rate Limit (5 per 15min)
- [ ] Test 7: Approval Rate Limit (10 per 15min)
- [ ] Test 8a: Direct URL Access Blocked
- [ ] Test 8b: No Auth Access Blocked
- [ ] Test 8c: Wrong User Access Blocked
- [ ] Test 8d: Owner Access Allowed
- [ ] Test 8e: Admin Access Allowed
- [ ] Test 9: File Permissions (600)
- [ ] Test 10: Token Cleanup ($unset)
- [ ] Automated Test Suite Passes

---

## Production Readiness Criteria

✅ **Pass Criteria:** All tests above must pass

❌ **Fail Criteria:** If ANY test fails, system is NOT production-ready

**Sign-off:**
- [ ] All manual tests completed and passed
- [ ] All automated tests passing
- [ ] Security logs reviewed
- [ ] File permissions verified
- [ ] Database token cleanup verified

**Tested by:** ________________  
**Date:** ________________  
**Approved for Production:** ⬜ Yes  ⬜ No
