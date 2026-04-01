# Role Progression System

## Overview
The role progression system controls how a user moves through membership roles:

1. `supporter`
2. `candidate`
3. `member`
4. `honorary_member`
5. `network_leader`
6. `regional_leader`
7. `national_leader`
8. `network_guide`

Progress is calculated from contributions, direct referrals, total referral tree, and helped-advance events.

## Data Model
Main tables:

- `users`
  - `membership_role`, `referred_by_id`, `role_advanced_at`, `total_referral_count`
- `role_requirements`
  - per-role rules and thresholds (seeded configuration)
- `user_referral_stats`
  - cached computed counters for performance
- `role_advancements`
  - history of role transitions
- `advancement_requests`
  - pending/manual review requests (when approval mode is enabled)
- `payments`
  - contribution eligibility checks

## SQL Functions
Core functions in `public` schema:

- `calculate_total_referrals(UUID)`
- `count_direct_referrals_at_role(UUID, membership_role)`
- `count_helped_advance(UUID, membership_role, membership_role)`
- `recalculate_user_referral_stats(UUID)`
- `check_role_eligibility(UUID)`
- `advance_user_role(UUID, UUID)`
- `get_user_role_progress(UUID)`

These functions are used by dashboard and API routes for read/progress checks and advancement execution.

## API/Runtime Flow
Read-only progress:

1. UI calls `GET /api/user/role-progress`
2. API reads authenticated user
3. API calls `rpc('get_user_role_progress', { target_user_id })`
4. API returns normalized progress + referral stats for card rendering

Advancement check:

1. UI calls `POST /api/user/check-advancement`
2. Route calls:
   - `recalculate_user_referral_stats(userId)`
   - `checkAndAdvanceRole(userId)` (service layer)
3. Service uses:
   - `get_user_role_progress`
   - `advance_user_role` (if eligible and mode allows)

## Production Migrations Added
Recent production fixes:

- `20260306092000_create_get_user_role_progress_function.sql`
  - restored missing `get_user_role_progress(UUID)`
- `20260306094000_seed_role_requirements.sql`
  - seeded/upserted all 8 role requirement rows
- `20260306095500_restore_role_progression_functions.sql`
  - restored full progression function set
- `20260306101000_fix_count_helped_advance_ambiguity.sql`
  - fixed parameter ambiguity bug in `count_helped_advance`

## Verification Checklist
Run in production DB:

```sql
select role, role_level, display_name_uk from role_requirements order by role_level;
```

Expect 8 rows (`supporter`..`network_guide`).

```sql
select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public'
  and p.proname in (
    'calculate_total_referrals',
    'count_direct_referrals_at_role',
    'count_helped_advance',
    'recalculate_user_referral_stats',
    'check_role_eligibility',
    'advance_user_role',
    'get_user_role_progress'
  )
order by p.proname;
```

Expect all 7 functions.

Smoke test for a user:

```sql
with u as (select id from users where email = 'dobrozhanskiy@gmail.com' limit 1)
select recalculate_user_referral_stats((select id from u));

with u as (select id from users where email = 'dobrozhanskiy@gmail.com' limit 1)
select * from check_role_eligibility((select id from u));

with u as (select id from users where email = 'dobrozhanskiy@gmail.com' limit 1)
select * from get_user_role_progress((select id from u));
```

## Common Failure Modes
- `PGRST202` on `get_user_role_progress`
  - function missing in DB schema
- card message: `Дані про прогрес недоступні`
  - API returned `progress: null` due RPC/function issue
- `column reference ... is ambiguous` in function
  - PL/pgSQL parameter/column naming collision
- empty `role_requirements`
  - progression levels/next-role logic cannot resolve

## Operational Notes
- If role logic changes, update both:
  - SQL seed for `role_requirements`
  - UI constants in `src/lib/constants.ts` (`MEMBERSHIP_ROLES`, labels/privileges)
- Keep migrations idempotent (`ON CONFLICT DO UPDATE`) for safer production re-runs.
