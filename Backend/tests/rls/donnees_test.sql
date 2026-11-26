-- Données de test (exécutées en superutilisateur, donc sans RLS).
-- Établissement A : élève e1 (classe C1), élève e2 (sans classe), profs p1 (C1) et p2 (C2), chef A.
-- Établissement B : élève e3, chef B.  Ministère : m.
insert into auth.users (id) select ('00000000-0000-4000-8000-0000000000' || lpad(n::text, 2, '0'))::uuid from generate_series(1, 20) n;

insert into public.etablissement (id, nom) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'Lycée A'),
  ('bbbbbbbb-0000-4000-8000-000000000001', 'Lycée B');

insert into public.profil (id, role, etablissement_id, nom_complet) values
  ('00000000-0000-4000-8000-000000000001', 'eleve',         'aaaaaaaa-0000-4000-8000-000000000001', 'e1'),
  ('00000000-0000-4000-8000-000000000002', 'eleve',         'aaaaaaaa-0000-4000-8000-000000000001', 'e2'),
  ('00000000-0000-4000-8000-000000000003', 'eleve',         'bbbbbbbb-0000-4000-8000-000000000001', 'e3'),
  ('00000000-0000-4000-8000-000000000004', 'enseignant',    'aaaaaaaa-0000-4000-8000-000000000001', 'p1'),
  ('00000000-0000-4000-8000-000000000005', 'enseignant',    'aaaaaaaa-0000-4000-8000-000000000001', 'p2'),
  ('00000000-0000-4000-8000-000000000006', 'etablissement', 'aaaaaaaa-0000-4000-8000-000000000001', 'chefA'),
  ('00000000-0000-4000-8000-000000000007', 'etablissement', 'bbbbbbbb-0000-4000-8000-000000000001', 'chefB'),
  ('00000000-0000-4000-8000-000000000008', 'ministere',     null,                                   'm');

insert into public.classe (id, etablissement_id, enseignant_id, nom, niveau) values
  ('c1c1c1c1-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000004', 'C1', 'seconde'),
  ('c2c2c2c2-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000005', 'C2', 'seconde');

insert into public.inscription (classe_id, eleve_id) values
  ('c1c1c1c1-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001');

insert into public.experience (id, matiere, titre) values
  ('eeeeeeee-0000-4000-8000-000000000001', 'chimie', 'Dosage acide-base');
insert into public.corrige_experience (experience_id, contenu) values
  ('eeeeeeee-0000-4000-8000-000000000001', '{"reponse": "secret"}');

insert into public.tentative (id, eleve_id, experience_id, classe_id, debut_le, score) values
  ('f1f1f1f1-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'eeeeeeee-0000-4000-8000-000000000001', 'c1c1c1c1-0000-4000-8000-000000000001', now(), 80),
  ('f2f2f2f2-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002', 'eeeeeeee-0000-4000-8000-000000000001', null, now(), 60),
  ('f3f3f3f3-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', 'eeeeeeee-0000-4000-8000-000000000001', null, now(), 40);

insert into public.evenement_tentative (id, tentative_id, type, survenu_le) values
  ('a1a1a1a1-0000-4000-8000-000000000001', 'f1f1f1f1-0000-4000-8000-000000000001', 'ajout_reactif', now()),
  ('a2a2a2a2-0000-4000-8000-000000000001', 'f2f2f2f2-0000-4000-8000-000000000001', 'ajout_reactif', now());
