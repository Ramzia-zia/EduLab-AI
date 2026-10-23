-- =============================================================================
-- EduLab AI — schéma initial (Personne 3 : données, comptes, résultats)
--
-- Principes :
--   * Toute table de `public` a la sécurité au niveau des lignes (RLS) activée.
--   * Les règles d'accès vivent dans la base : le backend Node ne les contourne
--     jamais (il appelle Supabase avec le jeton de l'utilisateur).
--   * Les résultats (`attempts`) ont un identifiant généré côté client, ce qui
--     rend la synchronisation hors ligne idempotente.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Types
-- -----------------------------------------------------------------------------
create type public.user_role     as enum ('student', 'teacher', 'admin');
create type public.exercise_kind as enum ('qcm', 'numeric', 'text');

-- -----------------------------------------------------------------------------
-- Utilitaires génériques
-- -----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Comptes
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '' check (char_length(full_name) <= 120),
  role        public.user_role not null default 'student',
  grade_level text,
  school      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Contenu pédagogique (lecture seule pour les élèves et les enseignants)
-- -----------------------------------------------------------------------------
create table public.subjects (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  icon       text,
  position   smallint not null default 0,
  updated_at timestamptz not null default now()
);

create table public.courses (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references public.subjects (id) on delete cascade,
  slug        text not null unique,
  title       text not null,
  summary     text,
  body_md     text not null default '',
  grade_level text,
  position    smallint not null default 0,
  published   boolean not null default false,
  updated_at  timestamptz not null default now()
);

create table public.simulations (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references public.subjects (id) on delete cascade,
  slug        text not null unique,
  title       text not null,
  description text,
  grade_level text,
  -- Paramètres propres à la simulation (à définir avec la Personne 2).
  config      jsonb not null default '{}'::jsonb,
  position    smallint not null default 0,
  published   boolean not null default false,
  updated_at  timestamptz not null default now()
);

create table public.exercises (
  id                uuid primary key default gen_random_uuid(),
  course_id         uuid references public.courses (id) on delete cascade,
  simulation_id     uuid references public.simulations (id) on delete cascade,
  slug              text not null unique,
  title             text not null,
  statement         text not null,
  kind              public.exercise_kind not null,
  -- qcm : ["choix A", "choix B", ...]
  options           jsonb,
  -- qcm     : {"correct": 1}
  -- numeric : {"value": 10.0, "tolerance": 0.1, "unit": "mL"}
  -- text    : {"accepted": ["2H2 + O2 -> 2H2O"]}
  answer_key        jsonb not null,
  -- Indices progressifs, du plus léger au plus détaillé.
  hints             jsonb not null default '[]'::jsonb,
  difficulty        smallint not null default 1 check (difficulty between 1 and 3),
  estimated_minutes smallint check (estimated_minutes is null or estimated_minutes > 0),
  position          smallint not null default 0,
  published         boolean not null default false,
  updated_at        timestamptz not null default now(),
  constraint exercises_target_chk check (course_id is not null or simulation_id is not null)
);

-- Réponses courtes du mode hors ligne de l'assistant (« FAQ du programme »).
create table public.faq_entries (
  id         uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects (id) on delete set null,
  question   text not null,
  answer     text not null,
  keywords   text[] not null default '{}',
  published  boolean not null default false,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Classes
-- -----------------------------------------------------------------------------
-- Code de classe lisible (6 caractères hexadécimaux), unique.
create function public.generate_join_code()
returns text
language plpgsql
as $$
declare
  candidate text;
begin
  loop
    candidate := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.classes where join_code = candidate);
  end loop;
  return candidate;
end;
$$;

create table public.classes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.profiles (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  grade_level text,
  join_code   text not null unique default public.generate_join_code(),
  created_at  timestamptz not null default now()
);

create table public.class_members (
  class_id   uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (class_id, student_id)
);

-- -----------------------------------------------------------------------------
-- Résultats
-- -----------------------------------------------------------------------------
create table public.attempts (
  -- Généré par le client (UUID v4) : renvoyer le même essai ne crée pas de doublon.
  id               uuid primary key,
  student_id       uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  exercise_id      uuid references public.exercises (id),
  simulation_id    uuid references public.simulations (id),
  score            numeric(5, 2) not null check (score between 0 and 100),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  -- Paramètres et mesures propres à la simulation (volume versé, etc.).
  payload          jsonb not null default '{}'::jsonb,
  completed_at     timestamptz not null,
  created_at       timestamptz not null default now(),
  constraint attempts_target_chk check (exercise_id is not null or simulation_id is not null)
);

-- -----------------------------------------------------------------------------
-- Index
-- -----------------------------------------------------------------------------
create index courses_subject_idx       on public.courses (subject_id);
create index simulations_subject_idx   on public.simulations (subject_id);
create index exercises_course_idx      on public.exercises (course_id);
create index exercises_simulation_idx  on public.exercises (simulation_id);
create index classes_teacher_idx       on public.classes (teacher_id);
create index class_members_student_idx on public.class_members (student_id);
create index attempts_student_idx      on public.attempts (student_id, completed_at desc);
create index attempts_exercise_idx     on public.attempts (exercise_id);
create index attempts_simulation_idx   on public.attempts (simulation_id);

-- -----------------------------------------------------------------------------
-- Fonctions d'autorisation (security definer : évitent la récursion des RLS)
-- -----------------------------------------------------------------------------
create function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.is_teacher()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles
                 where id = auth.uid() and role in ('teacher', 'admin'));
$$;

create function public.owns_class(p_class uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.classes where id = p_class and teacher_id = auth.uid());
$$;

create function public.is_member_of_class(p_class uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.class_members
                 where class_id = p_class and student_id = auth.uid());
$$;

create function public.is_teacher_of(p_student uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.class_members cm
    join public.classes c on c.id = cm.class_id
    where cm.student_id = p_student and c.teacher_id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['profiles', 'subjects', 'courses', 'simulations', 'exercises', 'faq_entries']
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- Crée le profil à l'inscription. Le rôle « teacher » peut être demandé à
-- l'inscription ; « admin » ne peut jamais l'être (voir README : vérification
-- des enseignants à prévoir avant un déploiement large).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
begin
  insert into public.profiles (id, full_name, role, grade_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when requested_role = 'teacher' then 'teacher'::public.user_role
         else 'student'::public.user_role end,
    new.raw_user_meta_data ->> 'grade_level'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un utilisateur ne peut pas changer son propre rôle.
-- (auth.uid() est nul pour l'éditeur SQL et le service role : autorisés.)
create function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Le rôle ne peut pas être modifié.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- -----------------------------------------------------------------------------
-- Fonctions métier
-- -----------------------------------------------------------------------------
-- Un élève rejoint une classe grâce au code donné par l'enseignant.
create function public.join_class(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise.' using errcode = '28000';
  end if;

  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'student') then
    raise exception 'Seuls les élèves peuvent rejoindre une classe.' using errcode = '42501';
  end if;

  select id into v_class from public.classes where join_code = upper(trim(p_code));
  if v_class is null then
    raise exception 'Code de classe invalide.' using errcode = 'P0002';
  end if;

  insert into public.class_members (class_id, student_id)
  values (v_class, auth.uid())
  on conflict do nothing;

  return v_class;
end;
$$;

-- Empreinte du contenu publié visible par l'appelant : change dès qu'un contenu
-- est ajouté, modifié, retiré ou dépublié. Le client compare cette valeur pour
-- éviter de retélécharger le contenu inutilement.
create function public.content_version()
returns text
language sql
stable
security invoker
set search_path = public
as $$
  select md5(string_agg(part, '|' order by part))
  from (
    select 'subjects:'    || count(*) || ':' || coalesce(max(updated_at)::text, '') as part
      from public.subjects
    union all
    select 'courses:'     || count(*) || ':' || coalesce(max(updated_at)::text, '')
      from public.courses where published
    union all
    select 'simulations:' || count(*) || ':' || coalesce(max(updated_at)::text, '')
      from public.simulations where published
    union all
    select 'exercises:'   || count(*) || ':' || coalesce(max(updated_at)::text, '')
      from public.exercises where published
    union all
    select 'faq:'         || count(*) || ':' || coalesce(max(updated_at)::text, '')
      from public.faq_entries where published
  ) parts;
$$;

-- Progression par élève et par classe (tableau de l'espace enseignant).
-- security_invoker : les règles RLS de l'enseignant s'appliquent.
create view public.class_student_progress
with (security_invoker = true) as
select
  cm.class_id,
  p.id                                                          as student_id,
  p.full_name,
  count(a.id)::int                                              as attempts_count,
  count(distinct coalesce(a.exercise_id, a.simulation_id))::int as activities_done,
  round(avg(a.score), 1)                                        as average_score,
  max(a.completed_at)                                           as last_activity_at
from public.class_members cm
join public.profiles p on p.id = cm.student_id
left join public.attempts a on a.student_id = cm.student_id
group by cm.class_id, p.id, p.full_name;

-- -----------------------------------------------------------------------------
-- Sécurité au niveau des lignes
-- -----------------------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.subjects      enable row level security;
alter table public.courses       enable row level security;
alter table public.simulations   enable row level security;
alter table public.exercises     enable row level security;
alter table public.faq_entries   enable row level security;
alter table public.classes       enable row level security;
alter table public.class_members enable row level security;
alter table public.attempts      enable row level security;

-- Profils
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_teacher_of(id) or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Matières : visibles par tous les utilisateurs connectés
create policy subjects_read on public.subjects for select to authenticated using (true);
create policy subjects_admin_write on public.subjects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Contenu publié : lecture pour tous, écriture réservée aux administrateurs
do $$
declare
  t text;
begin
  foreach t in array array['courses', 'simulations', 'exercises', 'faq_entries']
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated
         using (published or public.is_admin())', t || '_read', t);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (public.is_admin()) with check (public.is_admin())', t || '_admin_write', t);
  end loop;
end;
$$;

-- Classes
create policy classes_teacher_all on public.classes for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid() and public.is_teacher());
create policy classes_member_read on public.classes for select to authenticated
  using (public.is_member_of_class(id));

-- Membres : ajout uniquement via join_class(), départ possible par l'élève ou l'enseignant
create policy class_members_read on public.class_members for select to authenticated
  using (student_id = auth.uid() or public.owns_class(class_id));
create policy class_members_delete on public.class_members for delete to authenticated
  using (student_id = auth.uid() or public.owns_class(class_id));

-- Résultats : l'élève écrit et lit les siens ; l'enseignant lit ceux de ses élèves
create policy attempts_insert_own on public.attempts for insert to authenticated
  with check (student_id = auth.uid());
create policy attempts_read on public.attempts for select to authenticated
  using (student_id = auth.uid() or public.is_teacher_of(student_id) or public.is_admin());

-- -----------------------------------------------------------------------------
-- Droits d'exécution
-- -----------------------------------------------------------------------------
revoke all on function public.join_class(text) from public;
grant execute on function public.join_class(text)         to authenticated;
grant execute on function public.content_version()        to authenticated;
grant execute on function public.is_admin()               to authenticated;
grant execute on function public.is_teacher()             to authenticated;
grant execute on function public.owns_class(uuid)         to authenticated;
grant execute on function public.is_member_of_class(uuid) to authenticated;
grant execute on function public.is_teacher_of(uuid)      to authenticated;
