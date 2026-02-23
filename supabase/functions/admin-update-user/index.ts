import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is IT Support
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if caller has it_support role
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "it_support")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: IT Support role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, targetUserId, ...params } = body;
    
    console.log("=== REQUEST RECEIVED ===");
    console.log("Action:", action);
    console.log("Target User ID:", targetUserId);
    console.log("Params:", params);
    console.log("Caller ID:", caller.id);
    console.log("========================");

    if (action === "reset_password") {
      const { newPassword } = params;
      const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
        password: newPassword,
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_email") {
      const { newEmail } = params;
      const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
        email: newEmail,
        email_confirm: true,
      });
      if (error) throw error;
      // Also update profile
      await adminClient.from("profiles").update({ email: newEmail }).eq("user_id", targetUserId);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_profile") {
      const { fullName, branch, phoneNumber } = params;
      console.log("Update profile params:", { fullName, branch, phoneNumber, targetUserId });
      const updates: Record<string, any> = {};
      if (fullName !== undefined) updates.full_name = fullName;
      if (branch !== undefined) updates.branch = branch;
      if (phoneNumber !== undefined) updates.phone_number = phoneNumber;
      console.log("Updates to apply:", updates);
      const { error } = await adminClient.from("profiles").update(updates).eq("user_id", targetUserId);
      if (error) {
        console.error("Profile update error:", error);
        throw error;
      }
      console.log("Profile updated successfully");
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_role") {
      const { newRole } = params;
      // Remove existing non-default roles, add new one
      await adminClient.from("user_roles").delete().eq("user_id", targetUserId).neq("role", "user");
      if (newRole !== "user") {
        const { error } = await adminClient.from("user_roles").insert({ user_id: targetUserId, role: newRole });
        if (error) throw error;
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_user") {
      console.log("=== DELETE USER ACTION STARTED ===");
      console.log("Target user ID:", targetUserId);
      console.log("Caller ID:", caller.id);
      
      try {
        // Clear any edit_duration_settings references
        console.log("Step 1: Clearing edit_duration_settings references...");
        const { error: settingsError } = await adminClient
          .from("edit_duration_settings")
          .update({ updated_by: null })
          .eq("updated_by", targetUserId);
        if (settingsError) {
          console.error("Warning - Error clearing edit duration settings:", settingsError);
        } else {
          console.log("✓ Cleared edit_duration_settings references");
        }

        // Clear receipts user_id references
        console.log("Step 2: Clearing receipts references...");
        const { error: receiptsError } = await adminClient
          .from("receipts")
          .update({ user_id: null })
          .eq("user_id", targetUserId);
        if (receiptsError) {
          console.error("Warning - Error clearing receipts:", receiptsError);
        } else {
          console.log("✓ Cleared receipts references");
        }

        // Clear generated_listings user_id references
        console.log("Step 3: Clearing generated_listings references...");
        const { error: listingsError } = await adminClient
          .from("generated_listings")
          .update({ user_id: null })
          .eq("user_id", targetUserId);
        if (listingsError) {
          console.error("Warning - Error clearing listings:", listingsError);
        } else {
          console.log("✓ Cleared generated_listings references");
        }
        
        // Delete user roles
        console.log("Step 4: Deleting user roles...");
        const { error: rolesError } = await adminClient.from("user_roles").delete().eq("user_id", targetUserId);
        if (rolesError) {
          console.error("✗ Error deleting user roles:", rolesError);
          throw new Error(`Failed to delete user roles: ${rolesError.message}`);
        }
        console.log("✓ Deleted user roles");
        
        // Delete profile
        console.log("Step 5: Deleting profile...");
        const { error: profileError } = await adminClient.from("profiles").delete().eq("user_id", targetUserId);
        if (profileError) {
          console.error("✗ Error deleting profile:", profileError);
          throw new Error(`Failed to delete profile: ${profileError.message}`);
        }
        console.log("✓ Deleted profile");
        
        // Delete the auth user
        console.log("Step 4: Deleting auth user...");
        const { error: authError } = await adminClient.auth.admin.deleteUser(targetUserId);
        if (authError) {
          console.error("✗ Error deleting auth user:", authError);
          throw new Error(`Failed to delete auth user: ${authError.message}`);
        }
        console.log("✓ Deleted auth user successfully");
        console.log("=== DELETE USER ACTION COMPLETED ===");
        
        return new Response(JSON.stringify({ success: true, message: "User deleted successfully" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (deleteErr: any) {
        console.error("=== DELETE USER ACTION FAILED ===");
        console.error("Error details:", deleteErr);
        return new Response(JSON.stringify({ 
          error: deleteErr.message || "Failed to delete user",
          details: deleteErr.toString()
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.error("=== UNKNOWN ACTION ===");
    console.error("Received action:", action);
    console.error("Available actions: reset_password, update_email, update_profile, update_role, delete_user");
    return new Response(JSON.stringify({ error: "Unknown action", receivedAction: action }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
