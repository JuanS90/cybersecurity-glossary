import { isSupabaseConfigured } from "./lib/supabase";
import { mountAuthUi } from "./lib/auth-ui";
import { getPublishedEntries } from "./lib/glossary";

// The course remains a self-contained public page while backend features are
// implemented in later tasks. This entry point is the home for those features.
if (!isSupabaseConfigured) {
  document.documentElement.dataset.backend = "not-configured";
}

mountAuthUi();

void getPublishedEntries().then((entries) => {
  if (!entries) return;
  window.dispatchEvent(new CustomEvent("cyber-glossary:update", { detail: entries }));
}).catch(() => {
  // The original HTML glossary remains available when the backend is offline.
});
