-- =============================================================================
-- EduLab AI — données de démonstration (chimie : titrage acido-basique)
-- Rejouable sans danger : chaque insertion est protégée par `on conflict`.
-- =============================================================================

insert into public.subjects (slug, name, icon, position) values
  ('physique',      'Physique',      'atom',   1),
  ('chimie',        'Chimie',        'flask',  2),
  ('svt',           'SVT',           'leaf',   3),
  ('mathematiques', 'Mathématiques', 'sigma',  4)
on conflict (slug) do nothing;

insert into public.courses (subject_id, slug, title, summary, body_md, grade_level, position, published)
select s.id, 'reactions-acido-basiques', 'Les réactions acido-basiques',
       'Découvre comment un acide et une base réagissent, et comment les doser.',
$md$# Les réactions acido-basiques

## Acide, base et pH
Le **pH** mesure l'acidité d'une solution. À 25 °C :
- pH < 7 : solution **acide** ;
- pH = 7 : solution **neutre** ;
- pH > 7 : solution **basique**.

## Le titrage (ou dosage)
Doser une solution acide, c'est y verser peu à peu une solution basique de
concentration connue jusqu'à l'**équivalence**.

À l'équivalence, l'acide et la base ont réagi dans les proportions exactes de
l'équation de réaction. Pour un acide et une base qui échangent un seul ion H⁺ :

**Cₐ × Vₐ = C_b × V_b**

## L'indicateur coloré
La phénolphtaléine est incolore en milieu acide et **rose** en milieu basique.
Le changement de couleur signale que l'équivalence vient d'être dépassée.
$md$,
       'Seconde', 1, true
from public.subjects s where s.slug = 'chimie'
on conflict (slug) do nothing;

insert into public.simulations (subject_id, slug, title, description, grade_level, config, position, published)
select s.id, 'titrage-acido-basique', 'Titrage acido-basique',
       'Dose une solution d''acide chlorhydrique avec de la soude et observe la courbe du pH.',
       'Seconde',
       '{
          "analyte":  {"name": "HCl",  "concentration_mol_l": 0.10, "volume_ml": 25},
          "titrant":  {"name": "NaOH", "concentration_mol_l": 0.10},
          "indicator": "phenolphtaleine",
          "equivalence_volume_ml": 25
        }'::jsonb,
       1, true
from public.subjects s where s.slug = 'chimie'
on conflict (slug) do nothing;

-- Exercices rattachés au cours
insert into public.exercises
  (course_id, slug, title, statement, kind, options, answer_key, hints, difficulty, estimated_minutes, position, published)
select c.id, 'volume-equivalence', 'Volume à l''équivalence',
       'On dose 20,0 mL d''acide chlorhydrique de concentration 0,10 mol/L avec une solution de soude de concentration 0,20 mol/L. Quel volume de soude (en mL) faut-il verser pour atteindre l''équivalence ?',
       'numeric', null,
       '{"value": 10.0, "tolerance": 0.1, "unit": "mL"}'::jsonb,
       '["Que se passe-t-il pour les quantités de matière d''acide et de base à l''équivalence ?",
         "Utilise la relation Ca × Va = Cb × Vb : quelle est l''inconnue ?",
         "Isole Vb : Vb = (Ca × Va) / Cb. Attention aux unités."]'::jsonb,
       2, 10, 1, true
from public.courses c where c.slug = 'reactions-acido-basiques'
on conflict (slug) do nothing;

insert into public.exercises
  (course_id, slug, title, statement, kind, options, answer_key, hints, difficulty, estimated_minutes, position, published)
select c.id, 'ph-equivalence', 'pH à l''équivalence',
       'À 25 °C, on titre un acide fort par une base forte. Quel est le pH du mélange à l''équivalence ?',
       'qcm',
       '["pH inférieur à 7", "pH égal à 7", "pH supérieur à 7"]'::jsonb,
       '{"correct": 1}'::jsonb,
       '["Que reste-t-il dans la solution quand tout l''acide et toute la base ont réagi ?",
         "Les ions restants viennent d''un acide fort et d''une base forte : modifient-ils le pH ?"]'::jsonb,
       1, 5, 2, true
from public.courses c where c.slug = 'reactions-acido-basiques'
on conflict (slug) do nothing;

insert into public.exercises
  (course_id, slug, title, statement, kind, options, answer_key, hints, difficulty, estimated_minutes, position, published)
select c.id, 'equilibrer-eau', 'Équilibrer une équation',
       'Équilibre l''équation de formation de l''eau : H2 + O2 -> H2O',
       'text', null,
       '{"accepted": ["2H2 + O2 -> 2H2O", "2H2+O2->2H2O"]}'::jsonb,
       '["Compte les atomes d''oxygène de chaque côté de la flèche.",
         "Il faut le même nombre d''atomes de chaque élément avant et après la flèche.",
         "On ne change jamais les indices, seulement les coefficients devant les formules."]'::jsonb,
       1, 8, 3, true
from public.courses c where c.slug = 'reactions-acido-basiques'
on conflict (slug) do nothing;

-- Exercice rattaché à la simulation
insert into public.exercises
  (simulation_id, slug, title, statement, kind, options, answer_key, hints, difficulty, estimated_minutes, position, published)
select sim.id, 'titrage-volume-simulation', 'Trouve l''équivalence',
       'Avec la simulation, 25 mL d''acide chlorhydrique à 0,10 mol/L sont dosés par de la soude à 0,10 mol/L. À quel volume verse-t-on l''équivalence (en mL) ?',
       'numeric', null,
       '{"value": 25.0, "tolerance": 0.5, "unit": "mL"}'::jsonb,
       '["Observe la couleur de la solution : à quel moment change-t-elle ?",
         "Les deux concentrations sont identiques : que peux-tu en déduire pour les volumes ?"]'::jsonb,
       1, 10, 1, true
from public.simulations sim where sim.slug = 'titrage-acido-basique'
on conflict (slug) do nothing;

-- FAQ de l'assistant hors ligne (une entrée par notion fréquente)
insert into public.faq_entries (subject_id, question, answer, keywords, published)
select s.id, q.question, q.answer, q.keywords, true
from public.subjects s
cross join (values
  ('Pourquoi la solution devient-elle rose avec la phénolphtaléine ?',
   'La phénolphtaléine est incolore en milieu acide et rose en milieu basique. Quand la solution devient rose, le pH a dépassé environ 8 : tu viens de dépasser le point d''équivalence.',
   array['rose', 'phénolphtaléine', 'indicateur', 'couleur', 'basique']),
  ('Qu''est-ce que le point d''équivalence ?',
   'C''est le moment où l''acide et la base ont réagi dans les proportions exactes de l''équation de réaction. Pour un acide et une base qui échangent un seul H⁺ : n(acide) = n(base).',
   array['équivalence', 'point', 'titrage', 'dosage', 'burette']),
  ('Comment calculer le volume versé à l''équivalence ?',
   'Pour un acide et une base qui échangent un seul H⁺, utilise Ca × Va = Cb × Vb, puis isole le volume cherché. Vérifie que tes volumes sont dans la même unité.',
   array['calculer', 'volume', 'équivalence', 'formule', 'concentration']),
  ('Qu''est-ce que le pH ?',
   'Le pH mesure l''acidité d''une solution. À 25 °C : pH inférieur à 7, la solution est acide ; égal à 7, neutre ; supérieur à 7, basique.',
   array['ph', 'acide', 'basique', 'neutre', 'acidité']),
  ('Comment équilibrer une équation chimique ?',
   'Mets des coefficients devant les formules pour avoir le même nombre d''atomes de chaque élément de chaque côté de la flèche. Ne change jamais les indices.',
   array['équilibrer', 'équation', 'chimique', 'coefficients', 'atomes'])
) as q(question, answer, keywords)
where s.slug = 'chimie'
  and not exists (select 1 from public.faq_entries f where f.question = q.question);
