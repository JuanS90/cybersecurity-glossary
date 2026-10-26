import { supabase } from "./supabase";

export interface GlossaryEntry {
  id: string;
  term: string;
  translation_es: string;
  definition_en: string;
  example_en: string | null;
  category: "Threat" | "Security tool";
  source_reference: string | null;
  sort_order: number;
}

export interface ProposalData {
  term: string;
  translation_es: string;
  definition_en: string;
  example_en: string | null;
  category: "Threat" | "Security tool";
  source_reference: string | null;
}

export interface PendingProposal {
  id: string;
  operation: "create" | "edit";
  entry_id: string | null;
  proposed_data: ProposalData;
  submitted_by: string;
  submitted_at: string;
  submitter_name: string;
  current_data: ProposalData | null;
}

export async function getPublishedEntries(): Promise<GlossaryEntry[] | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("glossary_entries")
    .select("id, term, translation_es, definition_en, example_en, category, source_reference, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return null;
  return data as GlossaryEntry[];
}

export async function submitProposal(input: {
  operation: "create" | "edit";
  entryId?: string;
  data: ProposalData;
  userId: string;
}) {
  if (!supabase) throw new Error("Supabase is not configured.");

  return supabase.from("change_proposals").insert({
    operation: input.operation,
    entry_id: input.operation === "edit" ? input.entryId : null,
    proposed_data: input.data,
    submitted_by: input.userId,
  });
}

export async function getPendingProposals() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase.rpc("list_pending_glossary_proposals");
}

export async function reviewProposal(input: {
  proposalId: string;
  decision: "approve" | "reject";
  reviewNote?: string;
}) {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase.rpc("review_glossary_proposal", {
    p_proposal_id: input.proposalId,
    p_decision: input.decision,
    p_review_note: input.reviewNote?.trim() || null,
  });
}
