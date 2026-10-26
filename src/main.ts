import { isSupabaseConfigured } from "./lib/supabase";
import { mountAuthUi } from "./lib/auth-ui";
import { getPublishedEntries } from "./lib/glossary";

if (!isSupabaseConfigured) {
  document.documentElement.dataset.backend = "not-configured";
}

mountAuthUi();

void getPublishedEntries().then((entries) => {
  if (entries === null) {
    window.dispatchEvent(new CustomEvent("cyber-glossary:unavailable"));
    return;
  }
  window.dispatchEvent(new CustomEvent("cyber-glossary:update", { detail: entries }));
}).catch(() => {
  window.dispatchEvent(new CustomEvent("cyber-glossary:unavailable"));
});
