import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subjects, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "resources") {
      systemPrompt = "You are an educational resource curator. Generate high-quality study resources for students.";
      userPrompt = `Generate 2-3 study resources (YouTube tutorials, documentation, or articles) for the subject: ${subjects[0].name}. 
      The student scored ${subjects[0].marks}/${subjects[0].total}. 
      Return ONLY a JSON array with this structure: [{"title": "Resource Title", "type": "YouTube/Documentation/Article", "url": "https://example.com", "description": "Brief description"}]`;
    } else if (type === "studyPlan") {
      systemPrompt = "You are a study planner. Create personalized weekly study plans for students.";
      userPrompt = `Create a 5-day study plan for weak subjects: ${subjects.map((s: any) => `${s.name} (${s.marks}/${s.total})`).join(", ")}.
      Return ONLY a JSON array with this structure: [{"day": "Monday", "subject": "SubjectName", "task": "Specific task", "resources": "Suggested resource type"}]`;
    } else if (type === "summary") {
      systemPrompt = "You are an academic performance analyst. Provide concise, actionable insights.";
      userPrompt = `Analyze this student's performance: 
      Strong subjects: ${subjects.strong.map((s: any) => `${s.name} (${s.marks}/${s.total})`).join(", ")}
      Weak subjects: ${subjects.weak.map((s: any) => `${s.name} (${s.marks}/${s.total})`).join(", ")}
      Overall percentage: ${subjects.overall}%
      
      Write a concise 3-4 sentence summary highlighting strengths, areas to improve, and recommendations for better future performance.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-performance-insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
