# Security Fix: Secure has_role() Function

## Security Issue

The previous `has_role()` function using `SECURITY DEFINER` had a potential security vulnerability:
- It allowed checking ANY user's role, not just the authenticated user
- This could enable **role enumeration attacks** where malicious users could discover which users are admins
- Attackers could call `has_role('some-uuid', 'admin')` to check if arbitrary users are admins

## Security Improvements

This migration implements the following security enhancements:

### 1. **Restricted has_role() Function**
- Now only allows checking roles for the **authenticated user** (`auth.uid()`)
- Returns `FALSE` for any other user_id (without raising errors to prevent information leakage)
- Prevents role enumeration attacks

### 2. **New has_role_admin_check() Function**
- Internal function for RLS policies that need to check other users' roles
- Clearly named to indicate it's for admin checking
- Should only be used in RLS policies with proper authorization checks

### 3. **Explicit Permissions**
- Revokes PUBLIC access
- Grants EXECUTE only to authenticated users
- Follows principle of least privilege

## How to Apply

1. Go to your Supabase Dashboard: https://supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL from:
   `/supabase/migrations/20260210000004_secure_has_role_function.sql`
6. Click **Run** (or press Ctrl/Cmd + Enter)

## Important Notes

### Current Usage is Safe ✅
The current RLS policies using `has_role(auth.uid(), 'admin')` are **already secure** because they only check the authenticated user's role. The security fix prevents future misuse.

### If You Have Custom Policies
If you've created custom RLS policies that call `has_role()` with other user IDs, you may need to update them to use `has_role_admin_check()` instead, but **only** if those policies already have proper authorization checks.

## Example Usage

### ✅ Correct Usage (Checking Own Role)
```sql
-- In RLS policies - this is secure
CREATE POLICY "Admins can view all" ON some_table
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
```

### ❌ Previously Possible (Now Blocked)
```sql
-- Attempting to check another user's role
SELECT public.has_role('some-other-user-uuid', 'admin');
-- Now returns FALSE automatically for security
```

### ⚠️ Admin Check (Only in RLS Policies with Auth Checks)
```sql
-- Only use in policies that already verify authorization
CREATE POLICY "Complex admin check" ON some_table
  FOR ALL USING (
    auth.uid() = user_id OR 
    public.has_role_admin_check(auth.uid(), 'admin')
  );
```

## Testing

After applying the migration:

1. **Test normal role checking** (should work):
   ```sql
   SELECT public.has_role(auth.uid(), 'admin');
   ```

2. **Test protection against enumeration** (should return FALSE):
   ```sql
   SELECT public.has_role('00000000-0000-0000-0000-000000000000'::uuid, 'admin');
   ```

## Security Best Practices

✅ **DO:**
- Use `has_role(auth.uid(), 'role')` in RLS policies
- Check only the authenticated user's roles
- Review all SECURITY DEFINER functions regularly

❌ **DON'T:**
- Try to check other users' roles directly
- Use `has_role_admin_check()` outside of RLS policies
- Grant EXECUTE permissions to PUBLIC on sensitive functions

## Questions?

If you have custom policies or other security concerns, please review:
- All RLS policies using `has_role()`
- Any custom functions with SECURITY DEFINER
- Database permission grants

This migration strengthens your security posture by preventing role enumeration while maintaining all existing functionality.
