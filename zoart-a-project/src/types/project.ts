/** Shared browse/detail shape. membersWanted is the total desired team size. */
export type Project = {
  id: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  membersCurrent: number;
  membersWanted: number;
  contactInfo: string;
};
