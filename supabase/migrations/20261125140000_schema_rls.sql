begin;

create table if not exists public.etablissement (
  id uuid primary key,
  nom text not null,
  commune text,
  region text,
  actif boolean not null default true,
  cree_le timestamptz not null default now()
);

create table if not exists public.profil (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('eleve', 'enseignant', 'etablissement', 'ministere')),
  etablissement_id uuid references public.etablissement(id),
  nom_complet text not null,
  cree_le timestamptz not null default now(),
  check ((role = 'ministere') = (etablissement_id is null))
);

create table if not exists public.classe (
  id uuid primary key,
  etablissement_id uuid not null references public.etablissement(id),
  enseignant_id uuid not null references public.profil(id),
  nom text not null,
  niveau text not null,
  cree_le timestamptz not null default now()
);

create table if not exists public.inscription (
  classe_id uuid not null references public.classe(id) on delete cascade,
  eleve_id uuid not null references public.profil(id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (classe_id, eleve_id)
);

create table if not exists public.experience (
  id text primary key,
  matiere text not null check (matiere in ('physique', 'chimie', 'svt', 'genie_civil')),
  titre text not null,
  niveau text not null default '',
  version integer not null default 1 check (version > 0),
  parametres jsonb not null default '{}'::jsonb,
  cree_le timestamptz not null default now()
);

alter table public.experience add column if not exists niveau text not null default '';
alter table public.experience add column if not exists version integer not null default 1;

create table if not exists public.corrige_experience (
  experience_id text primary key references public.experience(id) on delete cascade,
  contenu jsonb not null
);

create table if not exists public.tentative (
  id uuid primary key,
  eleve_id uuid not null references public.profil(id),
  experience_id text not null references public.experience(id),
  classe_id uuid references public.classe(id),
  debut_le timestamptz not null,
  fin_le timestamptz,
  score numeric(5, 2),
  resultat jsonb,
  cree_le timestamptz not null default now()
);

alter table public.tentative add column if not exists resultat jsonb;

create table if not exists public.evenement_tentative (
  id uuid primary key,
  tentative_id uuid not null references public.tentative(id) on delete cascade,
  type text not null check (type ~ '^[a-z][a-z0-9_]{0,49}$'),
  charge jsonb not null default '{}'::jsonb,
  survenu_le timestamptz not null
);

-- Catalogue complet des définitions livrées dans Simulations/packages/labo_core.
insert into public.experience (id, matiere, titre, niveau, version, parametres) values
  ('focale_lentille', 'physique', U&'Distance focale d''une lentille mince', 'premiere', 1, $exp0${"id":"focale_lentille","matiere":"physique","niveau":"premiere","materiel":["banc_optique","lentille_convergente","ecran","source_lumineuse","objet_lumineux","miroir_plan","cherche_foyer","reglet"],"securite":[],"conseils":[{"quand":"autocollimation_sans_miroir","niveau":"avertissement","message":"Place le miroir plan juste derri\u00e8re la lentille."},{"quand":"bessel_distance_insuffisante","niveau":"avertissement","message":"Pour la m\u00e9thode de Bessel, il faut D > 4f'. \u00c9loigne l'\u00e9cran de l'objet."},{"quand":"image_nette_obtenue","niveau":"information","message":"L'image est nette. Lis les positions sur le banc."},{"quand":"trois_methodes_terminees","niveau":"validation","message":"Tu as trois valeurs de f'. Compare-les dans le tableau de conclusion."}],"calcul":"optique"}$exp0$::jsonb),
  ('lois_courant', 'physique', U&'Lois du courant : unicit\00E9 et n\0153uds', 'seconde', 1, $exp1${"id":"lois_courant","matiere":"physique","niveau":"seconde","materiel":["alimentation","amperemetre","resistor_r1","resistor_r2","interrupteur_k","fils"],"securite":[{"regle_id":"amperemetre_en_serie","avant":"fermer_interrupteur","exige":"amperemetre_en_serie","message":"Un amp\u00e8rem\u00e8tre se monte toujours en s\u00e9rie, jamais en d\u00e9rivation."},{"regle_id":"pas_de_court_circuit","avant":"fermer_interrupteur","exige":"montage_sans_court_circuit","message":"Ne relie jamais directement les deux bornes du g\u00e9n\u00e9rateur par un simple fil."},{"regle_id":"grand_calibre_en_premier","avant":"fermer_interrupteur","exige":"plus_grand_calibre","message":"Choisis d'abord le plus grand calibre, puis diminue-le progressivement."}],"conseils":[{"quand":"aiguille_hors_echelle","niveau":"avertissement","message":"L'aiguille d\u00e9passe l'\u00e9chelle. Choisis un calibre plus grand."},{"quand":"courants_serie_mesures","niveau":"validation","message":"Tu as mesur\u00e9 l'intensit\u00e9 aux trois points. Compare I1, I2 et I3."},{"quand":"derivation_mesuree","niveau":"information","message":"Tu as mesur\u00e9 I0, I1 et I2. Compare I0 \u00e0 la somme I1 + I2."}],"calcul":"electricite"}$exp1$::jsonb),
  ('lois_tensions', 'physique', U&'Lois des tensions', 'seconde', 1, $exp2${"id":"lois_tensions","matiere":"physique","niveau":"seconde","materiel":["alimentation","voltmetre","resistor_r1","resistor_r2","interrupteur_k","fils"],"securite":[{"regle_id":"pas_de_court_circuit","avant":"fermer_interrupteur","exige":"montage_sans_court_circuit","message":"Ne relie jamais directement les deux bornes du g\u00e9n\u00e9rateur par un simple fil."},{"regle_id":"grand_calibre_en_premier","avant":"fermer_interrupteur","exige":"plus_grand_calibre","message":"Choisis d'abord le plus grand calibre, puis diminue-le progressivement."}],"conseils":[{"quand":"voltmetre_en_serie","niveau":"avertissement","message":"Un voltm\u00e8tre se branche en d\u00e9rivation, aux bornes du dip\u00f4le."},{"quand":"somme_tensions_mesurees","niveau":"information","message":"Tu as mesur\u00e9 U_PA, U_AN et U_PN. Compare U_PA + U_AN \u00e0 U_PN."},{"quand":"tensions_derivation_mesurees","niveau":"information","message":"Tu as mesur\u00e9 U_PN, U1 et U2. Compare ces trois tensions."}],"calcul":"electricite"}$exp2$::jsonb),
  ('mesure_intensite', 'physique', U&'Mesure de l\2019intensit\00E9 du courant', 'seconde', 1, $exp3${"id":"mesure_intensite","matiere":"physique","niveau":"seconde","materiel":["alimentation","amperemetre_aiguille","multimetre","resistor_r1","resistor_r2","interrupteur_k","fils"],"securite":[{"regle_id":"amperemetre_en_serie","avant":"fermer_interrupteur","exige":"amperemetre_en_serie","message":"Un amp\u00e8rem\u00e8tre se monte toujours en s\u00e9rie, jamais en d\u00e9rivation."},{"regle_id":"pas_de_court_circuit","avant":"fermer_interrupteur","exige":"montage_sans_court_circuit","message":"Ne relie jamais directement les deux bornes du g\u00e9n\u00e9rateur par un simple fil."},{"regle_id":"grand_calibre_en_premier","avant":"fermer_interrupteur","exige":"plus_grand_calibre","message":"Choisis d'abord le plus grand calibre, puis diminue-le progressivement."}],"conseils":[{"quand":"aiguille_hors_echelle","niveau":"avertissement","message":"L'aiguille d\u00e9passe l'\u00e9chelle. Choisis un calibre plus grand."},{"quand":"calibre_reductible","niveau":"information","message":"Tu peux diminuer le calibre : l'aiguille restera sur l'\u00e9chelle et la mesure sera plus pr\u00e9cise."},{"quand":"calibre_optimal_atteint","niveau":"validation","message":"C'est le plus petit calibre qui garde l'aiguille sur l'\u00e9chelle. Note ta lecture."}],"calcul":"electricite"}$exp3$::jsonb),
  ('mesure_tension_masse', 'physique', U&'Mesure d\2019une tension et notion de masse', 'seconde', 1, $exp4${"id":"mesure_tension_masse","matiere":"physique","niveau":"seconde","materiel":["alimentation","voltmetre_aiguille","multimetre","resistor_r1","resistor_r2","interrupteur_k","fils"],"securite":[{"regle_id":"pas_de_court_circuit","avant":"fermer_interrupteur","exige":"montage_sans_court_circuit","message":"Ne relie jamais directement les deux bornes du g\u00e9n\u00e9rateur par un simple fil."},{"regle_id":"grand_calibre_en_premier","avant":"fermer_interrupteur","exige":"plus_grand_calibre","message":"Choisis d'abord le plus grand calibre, puis diminue-le progressivement."}],"conseils":[{"quand":"aiguille_hors_echelle","niveau":"avertissement","message":"L'aiguille d\u00e9passe l'\u00e9chelle. Choisis un calibre plus grand."},{"quand":"voltmetre_en_serie","niveau":"avertissement","message":"Un voltm\u00e8tre se branche en d\u00e9rivation, aux bornes du dip\u00f4le."},{"quand":"branchement_inverse","niveau":"information","message":"L'appareil affiche un signe moins : les bornes V et COM sont invers\u00e9es par rapport au sens de la tension."}],"calcul":"electricite"}$exp4$::jsonb),
  ('migration_ions', 'physique', U&'Migration des ions', 'seconde', 1, $exp5${"id":"migration_ions","matiere":"physique","niveau":"seconde","materiel":["alimentation","rheostat","amperemetre","papier_filtre","electrode_a","electrode_b","cristal_sulfate_cuivre","cristal_permanganate","gants","spatule","interrupteur_k","fils"],"securite":[{"regle_id":"gants_avant_cristaux","avant":"deposer_cristal","exige":"gants","message":"Le permanganate de potassium tache la peau et les v\u00eatements. Mets d'abord tes gants."},{"regle_id":"pas_de_court_circuit","avant":"fermer_interrupteur","exige":"montage_sans_court_circuit","message":"Ne relie jamais directement les deux bornes du g\u00e9n\u00e9rateur par un simple fil."},{"regle_id":"grand_calibre_en_premier","avant":"fermer_interrupteur","exige":"plus_grand_calibre","message":"Choisis d'abord le plus grand calibre, puis diminue-le progressivement."}],"conseils":[{"quand":"courant_nul","niveau":"avertissement","message":"Aucun courant ne passe. V\u00e9rifie que K est ferm\u00e9 et que le circuit est complet."},{"quand":"duree_observation_atteinte","niveau":"information","message":"Dix minutes se sont \u00e9coul\u00e9es. Tu peux ouvrir K et observer la position des taches."}],"calcul":"migration_ions"}$exp5$::jsonb),
  ('oscilloscope_tension', 'physique', U&'\00C9tude d\2019une tension \00E0 l\2019oscilloscope', 'seconde', 1, $exp6${"id":"oscilloscope_tension","matiere":"physique","niveau":"seconde","materiel":["alimentation","gbf","oscilloscope","multimetre","fils"],"securite":[{"regle_id":"masse_commune","avant":"mesurer","exige":"masse_commune","message":"Relie d'abord la masse du g\u00e9n\u00e9rateur \u00e0 la masse de l'oscilloscope."}],"conseils":[{"quand":"reference_non_reglee","niveau":"information","message":"Place le commutateur sur GND et am\u00e8ne la trace sur la ligne de r\u00e9f\u00e9rence (u = 0)."},{"quand":"trace_hors_ecran","niveau":"avertissement","message":"La trace sort de l'\u00e9cran. Choisis une sensibilit\u00e9 verticale plus grande (V/div)."},{"quand":"sensibilite_reductible","niveau":"information","message":"Tu peux choisir une sensibilit\u00e9 plus petite : la trace restera visible et la lecture sera plus pr\u00e9cise."}],"calcul":"oscilloscope"}$exp6$::jsonb),
  ('osmose_pomme_de_terre', 'svt', U&'\00C9changes d\2019eau : pomme de terre (SVT)', 'premiere', 1, $exp7${"id":"osmose_pomme_de_terre","matiere":"svt","niveau":"premiere","materiel":["tube_1","tube_2","tube_3","tube_4","pomme_de_terre","eau_distillee","solution_saccharose_125","solution_saccharose_250","solution_saccharose_375","couteau","regle"],"securite":[],"conseils":[{"quand":"tubes_identiques","niveau":"avertissement","message":"Deux tubes contiennent la m\u00eame solution. Change l'un d'eux pour pouvoir comparer."},{"quand":"deux_heures_ecoulees","niveau":"information","message":"Deux heures se sont \u00e9coul\u00e9es. Tu peux sortir les tranches et remesurer leur longueur."}],"calcul":"svt_osmose"}$exp7$::jsonb),
  ('sol_constituants', 'svt', U&'Constituants d\2019un sol (SVT)', 'seconde', 1, $exp8${"id":"sol_constituants","matiere":"svt","niveau":"seconde","materiel":["bocal","regle_graduee","terre","eau"],"securite":[],"conseils":[{"quand":"agitation_a_faire","niveau":"avertissement","message":"Ferme le bocal et secoue-le vigoureusement pendant 3 minutes."},{"quand":"couches_visibles","niveau":"information","message":"Les couches sont bien s\u00e9par\u00e9es. Mesure la hauteur de chaque couche et celle de la terre totale."}],"calcul":"svt_sol"}$exp8$::jsonb),
  ('titrage_acide_base', 'chimie', U&'Dosage acide-base', 'terminale', 1, $exp9${"id":"titrage_acide_base","matiere":"chimie","niveau":"terminale","materiel":["lunettes","burette","becher","soude","erlenmeyer","pipette","phenolphtaleine"],"securite":[{"regle_id":"lunettes_avant_soude","avant":"tourner_robinet","exige":"lunettes","message":"Mets d'abord tes lunettes : la soude peut ab\u00eemer les yeux."}],"conseils":[{"quand":"volume_proche_equivalence","niveau":"avertissement","message":"Tu approches de l'\u00e9quivalence. Ralentis : goutte \u00e0 goutte."},{"quand":"equivalence_atteinte","niveau":"validation","message":"Le rose p\u00e2le persiste : rep\u00e8re le volume vers\u00e9 sur la burette."}],"calcul":"titrage"}$exp9$::jsonb)
on conflict (id) do update set
  matiere = excluded.matiere, titre = excluded.titre, niveau = excluded.niveau,
  version = excluded.version, parametres = excluded.parametres;

create index if not exists classe_enseignant_idx on public.classe (enseignant_id);
create index if not exists classe_etablissement_idx on public.classe (etablissement_id);
create index if not exists inscription_eleve_idx on public.inscription (eleve_id);
create index if not exists tentative_eleve_date_idx on public.tentative (eleve_id, debut_le desc);
create index if not exists tentative_classe_idx on public.tentative (classe_id);
create index if not exists evenement_tentative_tentative_idx on public.evenement_tentative (tentative_id);

create or replace function public.role_courant()
returns text
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select p.role from public.profil p where p.id = auth.uid()
$$;

create or replace function public.etablissement_courant()
returns uuid
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select p.etablissement_id from public.profil p where p.id = auth.uid()
$$;

create or replace function public.est_inscrit_dans(p_classe_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1 from public.inscription i
    where i.classe_id = p_classe_id and i.eleve_id = auth.uid()
  )
$$;

create or replace function public.enseigne_classe(p_classe_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1 from public.classe c
    where c.id = p_classe_id and c.enseignant_id = auth.uid()
  )
$$;

create or replace function public.est_eleve_tentative(p_tentative_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1 from public.tentative t
    where t.id = p_tentative_id and t.eleve_id = auth.uid()
  )
$$;

grant execute on function public.role_courant() to authenticated;
grant execute on function public.etablissement_courant() to authenticated;
grant execute on function public.est_inscrit_dans(uuid) to authenticated;
grant execute on function public.enseigne_classe(uuid) to authenticated;
grant execute on function public.est_eleve_tentative(uuid) to authenticated;
grant usage on schema public to authenticated;

alter table public.etablissement enable row level security;
alter table public.profil enable row level security;
alter table public.classe enable row level security;
alter table public.inscription enable row level security;
alter table public.experience enable row level security;
alter table public.corrige_experience enable row level security;
alter table public.tentative enable row level security;
alter table public.evenement_tentative enable row level security;

drop policy if exists etablissement_lire_par_membre on public.etablissement;
create policy etablissement_lire_par_membre on public.etablissement
  for select to authenticated
  using (id = public.etablissement_courant());

drop policy if exists profil_lire_autorise on public.profil;
create policy profil_lire_autorise on public.profil
  for select to authenticated
  using (
    id = auth.uid()
    or (
      public.role_courant() = 'etablissement'
      and etablissement_id = public.etablissement_courant()
    )
  );

drop policy if exists classe_lire_autorisee on public.classe;
create policy classe_lire_autorisee on public.classe
  for select to authenticated
  using (
    (public.role_courant() = 'enseignant' and enseignant_id = auth.uid())
    or (
      public.role_courant() = 'etablissement'
      and etablissement_id = public.etablissement_courant()
    )
    or (public.role_courant() = 'eleve' and public.est_inscrit_dans(id))
  );

drop policy if exists inscription_lire_autorisee on public.inscription;
create policy inscription_lire_autorisee on public.inscription
  for select to authenticated
  using (
    eleve_id = auth.uid()
    or (public.role_courant() = 'enseignant' and public.enseigne_classe(classe_id))
    or (
      public.role_courant() = 'etablissement'
      and exists (
        select 1 from public.classe c
        where c.id = inscription.classe_id
          and c.etablissement_id = public.etablissement_courant()
      )
    )
  );

drop policy if exists experience_lire_connecte on public.experience;
create policy experience_lire_connecte on public.experience
  for select to authenticated using (true);

drop policy if exists corrige_lire_enseignant on public.corrige_experience;
create policy corrige_lire_enseignant on public.corrige_experience
  for select to authenticated using (public.role_courant() = 'enseignant');

drop policy if exists tentative_lire_autorisee on public.tentative;
create policy tentative_lire_autorisee on public.tentative
  for select to authenticated
  using (
    eleve_id = auth.uid()
    or (public.role_courant() = 'enseignant' and public.enseigne_classe(classe_id))
  );

drop policy if exists tentative_creer_par_eleve on public.tentative;
create policy tentative_creer_par_eleve on public.tentative
  for insert to authenticated
  with check (
    public.role_courant() = 'eleve'
    and eleve_id = auth.uid()
    and (classe_id is null or public.est_inscrit_dans(classe_id))
  );

drop policy if exists evenement_lire_autorise on public.evenement_tentative;
create policy evenement_lire_autorise on public.evenement_tentative
  for select to authenticated
  using (
    public.est_eleve_tentative(tentative_id)
    or (
      public.role_courant() = 'enseignant'
      and exists (
        select 1 from public.tentative t
        where t.id = evenement_tentative.tentative_id
          and public.enseigne_classe(t.classe_id)
      )
    )
  );

drop policy if exists evenement_creer_par_eleve on public.evenement_tentative;
create policy evenement_creer_par_eleve on public.evenement_tentative
  for insert to authenticated
  with check (
    public.role_courant() = 'eleve'
    and public.est_eleve_tentative(tentative_id)
  );

revoke all on public.etablissement, public.profil, public.classe, public.inscription,
  public.experience, public.corrige_experience, public.tentative,
  public.evenement_tentative from anon, authenticated;

grant select on public.etablissement, public.profil, public.classe,
  public.inscription, public.experience, public.corrige_experience,
  public.tentative, public.evenement_tentative to authenticated;
grant insert (id, eleve_id, experience_id, classe_id, debut_le, fin_le, resultat)
  on public.tentative to authenticated;
grant insert (id, tentative_id, type, charge, survenu_le)
  on public.evenement_tentative to authenticated;

create or replace view public.vue_stats_etablissement
with (security_barrier = true)
as
select
  p.etablissement_id,
  e.matiere,
  count(distinct t.eleve_id)::integer as nombre_eleves_actifs,
  count(*)::integer as nombre_tentatives,
  round(avg(t.score), 2)::double precision as score_moyen
from public.tentative t
join public.profil p on p.id = t.eleve_id
join public.experience e on e.id = t.experience_id
where p.etablissement_id = public.etablissement_courant()
  and public.role_courant() = 'etablissement'
group by p.etablissement_id, e.matiere;

create or replace view public.vue_stats_ministere
with (security_barrier = true)
as
select
  p.etablissement_id,
  et.nom as nom_etablissement,
  e.matiere,
  count(distinct t.eleve_id)::integer as nombre_eleves_actifs,
  count(*)::integer as nombre_tentatives,
  round(avg(t.score), 2)::double precision as score_moyen
from public.tentative t
join public.profil p on p.id = t.eleve_id
join public.experience e on e.id = t.experience_id
join public.etablissement et on et.id = p.etablissement_id
where public.role_courant() = 'ministere'
group by p.etablissement_id, et.nom, e.matiere;

revoke all on public.vue_stats_etablissement, public.vue_stats_ministere from anon, authenticated;
grant select on public.vue_stats_etablissement, public.vue_stats_ministere to authenticated;

commit;
