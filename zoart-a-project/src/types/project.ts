export type CreateProjectInput = {
  title: string;
  author: string;
  description: string;
  contact_info: string;
  tags: string[];
  major_ids?: string[];
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
  major_id?: string | null;
  major?: { id: string; name: string; degree: string } | null;
  project_majors?: { major: { id: string; name: string; degree: string } | null }[];
};
