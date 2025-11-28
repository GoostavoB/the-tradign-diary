import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupportRequest {
  email: string;
  category: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, category, subject, message }: SupportRequest = await req.json();

    // Validate input
    if (!email || !category || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const categoryLabels: Record<string, string> = {
      technical: "Technical Support",
      billing: "Billing",
      feature: "Feature Request",
      bug: "Bug Report",
      other: "Other",
    };

    const categoryLabel = categoryLabels[category] || category;

    // Send to support team
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "The Trading Diary <onboarding@resend.dev>",
        to: ["support@thetradingdiary.com"],
        reply_to: email,
        subject: `[${categoryLabel}] ${subject}`,
        html: `
          <h2>New Support Request</h2>
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Category:</strong> ${categoryLabel}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error("Failed to send email");
    }

    // Send confirmation to user
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "The Trading Diary <onboarding@resend.dev>",
        to: [email],
        subject: "We received your support request",
        html: `
          <h2>Thank you for contacting support!</h2>
          <p>We have received your ${categoryLabel.toLowerCase()} request and will respond as soon as possible.</p>
          <p><strong>Your request:</strong></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <br>
          <p>Our typical response time is within 24 hours.</p>
          <br>
          <p>Best regards,<br>The Trading Diary Support Team</p>
        `,
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-support-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
