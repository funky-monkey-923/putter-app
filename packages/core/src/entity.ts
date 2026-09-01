/**
 * The shared shape every user-facing item across every tool carries, per
 * the Product Plan's "loosely coupled, commonly modeled" integration model
 * (Section 4). Tools add their own type-specific fields on top of this, but
 * every record — a task, a note, a habit entry — has at least this much,
 * which is what makes cross-tool linking and global search possible without
 * one big polymorphic table.
 */
export interface EntityLink {
  type: string;
  id: string;
}

export interface BaseEntity {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  /** Soft-delete marker. Never physically delete a record — see Architecture Plan §5. */
  deletedAt: string | null;
  tags: string[];
  links: EntityLink[];
}
