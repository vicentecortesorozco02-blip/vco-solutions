-- A small logo per project, stored inline as a data URL.
-- The browser shrinks the image to 256 px before sending it, so a row stays
-- a few kilobytes and the logo is covered by the same RLS as the project.
alter table public.projects
  add column if not exists logo text
  check (logo is null or (logo like 'data:image/%' and length(logo) <= 200000));
