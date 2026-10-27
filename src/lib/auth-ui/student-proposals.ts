import { make } from "./shared";
import { getPublishedEntries, submitProposal, type ProposalData } from "../glossary";
import type { AuthProfile } from "../auth";
export function renderStudentProposalDialog(card: HTMLElement, profile: AuthProfile) {
  const openButton = make("button", "account-button-secondary", "Suggest a glossary change");
  openButton.type = "button";
  const dialog = make("dialog", "student-proposal-dialog");
  const heading = make("h2", undefined, "Suggest a glossary change");
  heading.id = "student-proposal-title";
  dialog.setAttribute("aria-labelledby", heading.id);
  const form = make("form");
  const message = make("p", "account-message", "A teacher reviews every suggestion before it appears in the public glossary.");
  message.setAttribute("aria-live", "polite");

  const operationLabel = make("label", undefined, "Change type");
  const operation = make("select");
  operation.name = "operation";
  for (const [value, label] of [["create", "Suggest a new entry"], ["edit", "Suggest an edit"]]) {
    const option = make("option", undefined, label);
    option.value = value;
    operation.append(option);
  }
  operationLabel.append(operation);

  const entryLabel = make("label", undefined, "Entry to edit");
  const entry = make("select");
  entry.name = "entry_id";
  entry.disabled = true;
  entryLabel.append(entry);

  const fields: Record<string, HTMLInputElement | HTMLTextAreaElement> = {};
  const addField = (name: string, labelText: string, multiline = false, required = true) => {
    const label = make("label", undefined, labelText);
    const control = multiline ? make("textarea") : make("input");
    control.name = name;
    control.required = required;
    if (name === "term" || name === "translation_es") control.maxLength = 200;
    if (name === "definition_en" || name === "example_en") control.maxLength = 3000;
    label.append(control);
    fields[name] = control;
    return label;
  };

  const categoryLabel = make("label", undefined, "Category");
  const category = make("select");
  category.name = "category";
  for (const [value, label] of [["Threat", "Threat"], ["Security tool", "Security tool"]]) {
    const option = make("option", undefined, label);
    option.value = value;
    category.append(option);
  }
  categoryLabel.append(category);

  const term = addField("term", "Term");
  const translation = addField("translation_es", "Spanish translation");
  const definition = addField("definition_en", "Definition in simple English", true);
  const example = addField("example_en", "Example in English (optional)", true, false);
  const source = addField("source_reference", "Source (optional)", false, false);
  const submit = make("button", undefined, "Send for teacher review");
  submit.type = "submit";
  const cancel = make("button", "account-button-secondary", "Cancel");
  cancel.type = "button";
  cancel.addEventListener("click", () => dialog.close());
  const actions = make("div", "dialog-actions");
  actions.append(cancel, submit);
  form.append(message, operationLabel, entryLabel, term, translation, definition, example, categoryLabel, source, actions);
  dialog.append(heading, form);
  card.append(openButton, dialog);

  let publishedEntries: Awaited<ReturnType<typeof getPublishedEntries>> = null;
  void getPublishedEntries().then((entries) => {
    publishedEntries = entries;
    entry.replaceChildren();
    const placeholder = make("option", undefined, "Select a published entry");
    placeholder.value = "";
    entry.append(placeholder);
    for (const item of entries ?? []) {
      const option = make("option", undefined, item.term);
      option.value = item.id;
      entry.append(option);
    }
    if (!entries) {
      entry.replaceChildren(make("option", undefined, "Published entries are unavailable"));
    } else if (entries.length === 0) {
      entry.replaceChildren(make("option", undefined, "No published entries are available"));
    }
    entry.disabled = operation.value !== "edit" || !entries || entries.length === 0;
  }).catch(() => {
    entry.replaceChildren(make("option", undefined, "Published entries are unavailable"));
  });

  const clearFields = () => {
    for (const field of Object.values(fields)) field.value = "";
    category.selectedIndex = 0;
  };

  const applySelectedEntry = () => {
    const selected = publishedEntries?.find((item) => item.id === entry.value);
    if (!selected) return;
    fields.term.value = selected.term;
    fields.translation_es.value = selected.translation_es;
    fields.definition_en.value = selected.definition_en;
    fields.example_en.value = selected.example_en ?? "";
    fields.source_reference.value = selected.source_reference ?? "";
    category.value = selected.category;
  };
  operation.addEventListener("change", () => {
    const editing = operation.value === "edit";
    entry.disabled = !editing || !publishedEntries || publishedEntries.length === 0;
    if (editing) {
      applySelectedEntry();
    } else {
      entry.selectedIndex = 0;
      clearFields();
    }
  });
  entry.addEventListener("change", applySelectedEntry);
  openButton.addEventListener("click", () => {
    if (!dialog.open) dialog.showModal();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const isEdit = operation.value === "edit";
    if (isEdit && !publishedEntries?.some((item) => item.id === entry.value)) {
      message.textContent = !publishedEntries
        ? "The published entry list is unavailable. Try again when the glossary service is available."
        : publishedEntries.length === 0
          ? "There are no published entries available to edit."
          : "Select a published entry to edit.";
      message.dataset.kind = "error";
      return;
    }
    submit.disabled = true;
    submit.textContent = "Sending…";
    message.textContent = "";
    const value = (name: string) => fields[name].value.trim();
    const data: ProposalData = {
      term: value("term"),
      translation_es: value("translation_es"),
      definition_en: value("definition_en"),
      example_en: value("example_en") || null,
      category: category.value as ProposalData["category"],
      source_reference: value("source_reference") || null,
    };
    try {
      const { error } = await submitProposal({
        operation: isEdit ? "edit" : "create",
        entryId: isEdit ? entry.value : undefined,
        data,
        userId: profile.user_id,
      });
      if (error) throw error;
      form.reset();
      entry.selectedIndex = 0;
      entry.disabled = true;
      message.textContent = "Suggestion sent. It will stay private until a teacher reviews it.";
      message.dataset.kind = "info";
    } catch {
      message.textContent = "The suggestion could not be sent. Check your connection or contact your teacher.";
      message.dataset.kind = "error";
      message.setAttribute("role", "alert");
    } finally {
      submit.disabled = false;
      submit.textContent = "Send for teacher review";
    }
  });
}
