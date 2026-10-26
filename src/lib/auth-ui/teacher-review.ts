import { make } from "./shared";
import {
  getPendingProposals,
  reviewProposal,
  type PendingProposal,
  type ProposalData,
} from "../glossary";
function renderProposalData(host: HTMLElement, title: string, data: ProposalData) {
  const section = make("section", "proposal-version");
  section.append(make("h3", undefined, title));
  const fields = make("dl", "proposal-fields");
  const labels: Array<[keyof ProposalData, string]> = [
    ["term", "Term"],
    ["translation_es", "Spanish translation"],
    ["definition_en", "Definition"],
    ["example_en", "Example"],
    ["category", "Category"],
    ["source_reference", "Source"],
  ];
  for (const [key, label] of labels) {
    fields.append(make("dt", undefined, label), make("dd", undefined, data[key] || "—"));
  }
  section.append(fields);
  host.append(section);
}

export function renderTeacherProposalQueue(card: HTMLElement) {
  const openButton = make("button", "account-button-secondary", "Review glossary proposals");
  openButton.type = "button";
  const dialog = make("dialog", "proposal-review-dialog");
  const heading = make("h2", undefined, "Glossary proposals to review");
  heading.id = "proposal-review-title";
  dialog.setAttribute("aria-labelledby", heading.id);
  const message = make("p", "account-message", "Pending student suggestions appear here.");
  message.setAttribute("aria-live", "polite");
  const list = make("ul", "proposal-review-list");
  const closeButton = make("button", "account-button-secondary", "Close");
  closeButton.type = "button";
  closeButton.addEventListener("click", () => dialog.close());
  dialog.append(heading, message, list, closeButton);
  card.append(openButton, dialog);

  const loadProposals = async () => {
    list.replaceChildren(make("li", undefined, "Loading proposals…"));
    try {
      const { data, error } = await getPendingProposals();
      if (error) throw error;
      const proposals = (data ?? []) as PendingProposal[];
      list.replaceChildren();
      if (proposals.length === 0) {
        list.append(make("li", "proposal-empty", "There are no pending proposals."));
        message.textContent = "The queue is up to date.";
        message.dataset.kind = "info";
        return;
      }

      message.textContent = `${proposals.length} proposal${proposals.length === 1 ? "" : "s"} waiting for review.`;
      message.dataset.kind = "info";
      for (const proposal of proposals) {
        const item = make("li", "proposal-review-item");
        const title = proposal.operation === "create" ? "New glossary entry" : "Suggested edit";
        item.append(make("h3", undefined, title));
        const submittedAt = new Date(proposal.submitted_at).toLocaleString();
        item.append(make("p", "proposal-author", `From ${proposal.submitter_name} · ${submittedAt}`));
        if (proposal.current_data) renderProposalData(item, "Published version", proposal.current_data);
        renderProposalData(item, "Student suggestion", proposal.proposed_data);

        const noteLabel = make("label", undefined, "Review note (optional)");
        const note = make("textarea");
        note.maxLength = 2000;
        noteLabel.append(note);
        const actions = make("div", "proposal-review-actions");
        const approve = make("button", undefined, "Approve and publish");
        approve.type = "button";
        const reject = make("button", "account-button-secondary", "Reject");
        reject.type = "button";
        actions.append(approve, reject);
        item.append(noteLabel, actions);

        const decide = async (decision: "approve" | "reject") => {
          approve.disabled = true;
          reject.disabled = true;
          message.textContent = decision === "approve" ? "Publishing proposal…" : "Rejecting proposal…";
          try {
            const { error: reviewError } = await reviewProposal({
              proposalId: proposal.id,
              decision,
              reviewNote: note.value,
            });
            if (reviewError) throw reviewError;
            message.textContent = decision === "approve" ? "Proposal approved and published." : "Proposal rejected.";
            message.dataset.kind = "info";
            await loadProposals();
          } catch {
            approve.disabled = false;
            reject.disabled = false;
            message.textContent = "The proposal could not be reviewed. Refresh the queue and try again.";
            message.dataset.kind = "error";
            message.setAttribute("role", "alert");
          }
        };
        approve.addEventListener("click", () => void decide("approve"));
        reject.addEventListener("click", () => void decide("reject"));
        list.append(item);
      }
    } catch {
      list.replaceChildren();
      message.textContent = "Proposals could not be loaded. Check the connection and Supabase migration status.";
      message.dataset.kind = "error";
      message.setAttribute("role", "alert");
    }
  };

  openButton.addEventListener("click", () => {
    if (!dialog.open) dialog.showModal();
    void loadProposals();
  });
}
