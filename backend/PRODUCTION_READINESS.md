# Production Readiness Checklist

## Current Status: **Foundation Complete, Production Gaps Identified**

---

## ✅ Completed (Solid Foundation)

### Core Functionality
- [x] Order creation with COD/non-COD differentiation
- [x] Admin approval email with Approve/Reject links
- [x] JWT-signed approval tokens with admin binding
- [x] Atomic `findOneAndUpdate` for idempotency
- [x] WhatsApp template message integration
- [x] Message ID storage in `MessageLog`
- [x] Audit logging in `AdminActionLog`
- [x] Clean controller architecture with helper functions
- [x] Comprehensive test suite for token security

### Security
- [x] 64-char `APPROVAL_TOKEN_SECRET`
- [x] Admin email/IP binding in tokens
- [x] Unique JTI (JWT ID) per token
- [x] Token expiry (24 hours)
- [x] Single-use tokens (cleared after approval)
- [x] 409 Conflict for duplicate approvals
- [x] Tamper detection (invalid signature → 400)

### Database
- [x] Indexes on `status` and `approvalToken`
- [x] `AdminActionLog` model
- [x] `MessageLog` model
- [x] Webhook handler with DB persistence

---

## 🔥 CRITICAL GAPS (Must Fix Before Production)

### Queue System
- [ ] Install BullMQ + Redis
- [ ] Create `services/queueService.js`
- [ ] Create `workers/notificationWorker.js`
- [ ] Move email sending to queue
- [ ] Move WhatsApp sending to queue
- [ ] Configure retry strategy (3 attempts, exponential backoff)

### Dead Letter Queue (DLQ)
- [ ] Configure `email-dlq` and `whatsapp-dlq`
- [ ] Create admin API for DLQ management
- [ ] Add manual retry endpoint
- [ ] Store failure metadata (error, attemptCount)

### Two-Factor Admin Approval
- [ ] Change email link to frontend dashboard
- [ ] Create `ApproveOrder.tsx` admin page
- [ ] Require admin JWT + approval token
- [ ] Update `approveOrder` endpoint with auth check

### Comprehensive Audit Trail
- [ ] Create `AuditLog` model with before/after state
- [ ] Create audit middleware
- [ ] Log all admin actions
- [ ] Track status changes with old/new values

---

## ⚠️ IMPORTANT (Fix Soon)

### Security
- [ ] WhatsApp webhook signature verification
- [ ] Add `WHATSAPP_APP_SECRET` to `.env`
- [ ] Verify `X-Hub-Signature-256` header
- [ ] Global API rate limiting (100 req/15min)
- [ ] Order creation rate limit (5/hour per IP)
- [ ] Admin approval rate limit (20/hour)

### Reliability
- [ ] Email retry with exponential backoff
- [ ] SendGrid → SMTP fallback with retry
- [ ] Network timeout handling
- [ ] Redis disconnect recovery
- [ ] MongoDB reconnection logic

---

## ⚪ OPTIONAL (Professional Polish)

### Admin Dashboard
- [ ] Message logs table (sent/delivered/failed)
- [ ] Filter by order ID, phone, status
- [ ] Resend failed messages button
- [ ] Export logs to CSV
- [ ] Real-time status updates

### Testing
- [ ] Duplicate email scenario test
- [ ] Network timeout tests (5s, 10s, 30s)
- [ ] Database failover tests
- [ ] Concurrent approval tests
- [ ] JWT rotation tests
- [ ] Load testing (100 concurrent approvals)

---

## Estimated Timeline

| Phase | Tasks | Time | Status |
|-------|-------|------|--------|
| **Phase 1: Queue System** | BullMQ setup, worker, queue integration | 4-6 hours | ⏳ Pending |
| **Phase 2: DLQ + Audit** | DLQ config, audit trail, admin API | 4-5 hours | ⏳ Pending |
| **Phase 3: Security** | 2FA approval, webhook sig, rate limits | 5-6 hours | ⏳ Pending |
| **Phase 4: Polish** | Dashboard, tests, docs | 10-14 hours | ⏳ Pending |

**Total Critical Path**: 15-20 hours

---

## Next Actions

1. **Install Redis** (local or Redis Cloud free tier)
2. **Choose Priority**:
   - Option A: Full queue system (recommended)
   - Option B: Critical fixes only (DLQ + 2FA)
3. **Confirm Approach** before implementation

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Server hangs under load | High | High | ✅ Queue system |
| Lost WhatsApp messages | High | Medium | ✅ DLQ |
| Email hack → unauthorized approvals | Critical | Low | ✅ Two-factor approval |
| Fake webhook events | Medium | Medium | ✅ Signature verification |
| Rate limit abuse | Medium | High | ✅ Global rate limiting |

---

## Questions to Answer

- [ ] Is Redis available? (Required for BullMQ)
- [ ] Should we implement all critical items or prioritize?
- [ ] Do you want the admin dashboard now or later?
- [ ] Any specific load/performance targets?
