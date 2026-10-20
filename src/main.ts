import { isSupabaseConfigured } from "./lib/supabase";

// The course remains a self-contained public page while backend features are
// implemented in later tasks. This entry point is the home for those features.
if (!isSupabaseConfigured) {
  document.documentElement.dataset.backend = "not-configured";
}
