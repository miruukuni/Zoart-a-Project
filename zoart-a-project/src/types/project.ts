export type CreateProjectInput = {
  title: string;
  author: string;
  description: string;
  contact_info: string;
  tags: string[];
};

export type Project = {
  id: string | number;
  title: string | null;
  author: string | null;
  description: string | null;
  contact_info: string | null;
  tags: string[] | null;
  status: string | null;
  created_at: string | null;
};
