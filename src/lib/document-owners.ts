export type DocumentOwner = { id: string; full_name: string; email: string };

export function attachDocumentOwners<T extends { user_id: string }>(
  documents: T[],
  profiles: DocumentOwner[],
) {
  const owners = new Map(profiles.map((profile) => [profile.id, profile]));
  return documents.map((document) => ({
    ...document,
    owner: owners.get(document.user_id) ?? null,
  }));
}