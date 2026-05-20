-- ============================================================
-- 9급 공무원 5과목 통합 학습 웹앱 DB 스키마
-- Supabase SQL 에디터에서 순서대로 실행
-- ============================================================

-- ── 1. 공통 사용자 상태 테이블 ─────────────────────────────

CREATE TABLE IF NOT EXISTS user_views (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users ON DELETE CASCADE,
  subject         TEXT NOT NULL,
  item_type       TEXT NOT NULL,
  item_key        TEXT NOT NULL,
  view_count      INT DEFAULT 1,
  first_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject, item_type, item_key)
);
CREATE INDEX IF NOT EXISTS idx_user_views_user_subject ON user_views(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_user_views_subject_type ON user_views(subject, item_type);

CREATE TABLE IF NOT EXISTS user_bookmarks (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID REFERENCES auth.users ON DELETE CASCADE,
  subject    TEXT NOT NULL,
  item_type  TEXT NOT NULL,
  item_key   TEXT NOT NULL,
  label      TEXT,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject, item_type, item_key)
);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_subject ON user_bookmarks(user_id, subject);

CREATE TABLE IF NOT EXISTS user_checklist_progress (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID REFERENCES auth.users ON DELETE CASCADE,
  subject    TEXT NOT NULL,
  item_id    TEXT NOT NULL,
  checked    BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject, item_id)
);

CREATE TABLE IF NOT EXISTS user_mini_quiz_attempts (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID REFERENCES auth.users ON DELETE CASCADE,
  subject       TEXT NOT NULL,
  quiz_type     TEXT NOT NULL,
  item_key      TEXT,
  is_correct    BOOLEAN,
  time_spent_sec INT,
  attempted_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mini_quiz_user_subject ON user_mini_quiz_attempts(user_id, subject);

-- ── 2. 함정 패턴 (전 과목 공유) ───────────────────────────

CREATE TABLE IF NOT EXISTS trap_patterns (
  id              BIGSERIAL PRIMARY KEY,
  subject         TEXT NOT NULL,
  rank            INT,
  title           TEXT NOT NULL,
  description     TEXT,
  incorrect_form  TEXT,
  correct_form    TEXT,
  trap_category   TEXT,
  frequency       TEXT,
  countermeasure  TEXT,
  example         TEXT,
  exam_appeared_in TEXT
);
CREATE INDEX IF NOT EXISTS idx_traps_subject ON trap_patterns(subject);

CREATE TABLE IF NOT EXISTS user_trap_progress (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users ON DELETE CASCADE,
  trap_id         BIGINT REFERENCES trap_patterns(id) ON DELETE CASCADE,
  understood      BOOLEAN DEFAULT FALSE,
  repetitions     INT DEFAULT 0,
  ease_factor     FLOAT DEFAULT 2.5,
  interval        INT DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at  TIMESTAMPTZ,
  UNIQUE(user_id, trap_id)
);

-- ── 3. 국어 특화 ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS korean_areas (
  id                  BIGSERIAL PRIMARY KEY,
  area_key            TEXT UNIQUE NOT NULL,
  name_ko             TEXT NOT NULL,
  rank                INT,
  study_weight        INT,
  difficulty          TEXT,
  frequency_per_round TEXT
);

-- ── 4. 영어 특화 ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vocab_words (
  id                  BIGSERIAL PRIMARY KEY,
  word                TEXT NOT NULL,
  meaning_ko          TEXT NOT NULL,
  meaning_en          TEXT,
  category            TEXT NOT NULL,
  difficulty          INT DEFAULT 1,
  example_sentence    TEXT,
  example_translation TEXT,
  exam_appeared_in    TEXT,
  synonym             TEXT[],
  antonym             TEXT[],
  pronunciation       TEXT,
  audio_url           TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vocab_category ON vocab_words(category);

CREATE TABLE IF NOT EXISTS vocab_progress (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users ON DELETE CASCADE,
  vocab_id        BIGINT REFERENCES vocab_words(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'new',
  correct_count   INT DEFAULT 0,
  wrong_count     INT DEFAULT 0,
  repetitions     INT DEFAULT 0,
  ease_factor     FLOAT DEFAULT 2.5,
  interval        INT DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at  TIMESTAMPTZ,
  mastery_level   INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vocab_id)
);
CREATE INDEX IF NOT EXISTS idx_vocab_progress_review ON vocab_progress(next_review_at);

CREATE TABLE IF NOT EXISTS grammar_patterns (
  id               BIGSERIAL PRIMARY KEY,
  pattern_number   INT,
  name             TEXT NOT NULL,
  form             TEXT,
  korean_meaning   TEXT,
  example_sentence TEXT,
  example_translation TEXT,
  equivalent_form  TEXT,
  key_point        TEXT,
  exam_appeared_in TEXT,
  related_verbs    TEXT[],
  difficulty       INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS grammar_pattern_views (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID REFERENCES auth.users ON DELETE CASCADE,
  pattern_id    BIGINT REFERENCES grammar_patterns(id) ON DELETE CASCADE,
  repetitions   INT DEFAULT 0,
  ease_factor   FLOAT DEFAULT 2.5,
  interval      INT DEFAULT 1,
  view_count    INT DEFAULT 1,
  understood    BOOLEAN DEFAULT FALSE,
  next_review_at TIMESTAMPTZ,
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pattern_id)
);

CREATE TABLE IF NOT EXISTS idioms (
  id                  BIGSERIAL PRIMARY KEY,
  phrase              TEXT NOT NULL,
  meaning_ko          TEXT NOT NULL,
  category            TEXT,
  example_sentence    TEXT,
  literal_translation TEXT,
  difficulty          INT DEFAULT 1,
  exam_appeared_in    TEXT
);

CREATE TABLE IF NOT EXISTS idiom_progress (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users ON DELETE CASCADE,
  idiom_id        BIGINT REFERENCES idioms(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'new',
  repetitions     INT DEFAULT 0,
  ease_factor     FLOAT DEFAULT 2.5,
  interval        INT DEFAULT 1,
  correct_count   INT DEFAULT 0,
  wrong_count     INT DEFAULT 0,
  next_review_at  TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id, idiom_id)
);

CREATE TABLE IF NOT EXISTS business_phrases (
  id                  BIGSERIAL PRIMARY KEY,
  phrase              TEXT NOT NULL,
  korean_translation  TEXT NOT NULL,
  context             TEXT,
  scenario            TEXT,
  difficulty          INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS announcement_traps (
  id             BIGSERIAL PRIMARY KEY,
  trap_category  TEXT NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  example        TEXT
);

-- ── 5. 한국사 특화 ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS eras (
  id          BIGSERIAL PRIMARY KEY,
  name_ko     TEXT NOT NULL,
  name_en     TEXT,
  start_year  INT,
  end_year    INT,
  color_hex   TEXT,
  description TEXT,
  sort_order  INT
);

CREATE TABLE IF NOT EXISTS dynasties (
  id          BIGSERIAL PRIMARY KEY,
  era_id      BIGINT REFERENCES eras(id),
  name_ko     TEXT NOT NULL,
  name_hanja  TEXT,
  start_year  INT,
  end_year    INT,
  founder_id  BIGINT,
  capital     TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS rulers (
  id               BIGSERIAL PRIMARY KEY,
  dynasty_id       BIGINT REFERENCES dynasties(id),
  name_ko          TEXT NOT NULL,
  name_hanja       TEXT,
  era_name         TEXT,
  birth_year       INT,
  death_year       INT,
  reign_start      INT,
  reign_end        INT,
  order_in_dynasty INT,
  achievements     JSONB,
  importance       INT
);

CREATE TABLE IF NOT EXISTS figures (
  id               BIGSERIAL PRIMARY KEY,
  era_id           BIGINT REFERENCES eras(id),
  name_ko          TEXT NOT NULL,
  name_hanja       TEXT,
  pen_name         TEXT,
  courtesy_name    TEXT,
  posthumous_name  TEXT,
  birth_year       INT,
  death_year       INT,
  role             TEXT,
  summary          TEXT,
  achievements     JSONB,
  image_url        TEXT,
  importance       INT,
  exam_appearances INT
);
CREATE INDEX IF NOT EXISTS idx_figures_era ON figures(era_id);
CREATE INDEX IF NOT EXISTS idx_figures_importance ON figures(importance DESC);
CREATE INDEX IF NOT EXISTS idx_figures_search ON figures USING gin (
  to_tsvector('simple', name_ko || ' ' || COALESCE(name_hanja, '') || ' ' || COALESCE(pen_name, ''))
);

CREATE TABLE IF NOT EXISTS figure_relations (
  id                BIGSERIAL PRIMARY KEY,
  figure_id         BIGINT REFERENCES figures(id),
  related_figure_id BIGINT REFERENCES figures(id),
  relation_type     TEXT,
  description       TEXT
);

CREATE TABLE IF NOT EXISTS historical_documents (
  id          BIGSERIAL PRIMARY KEY,
  era_id      BIGINT REFERENCES eras(id),
  name_ko     TEXT NOT NULL,
  name_hanja  TEXT,
  type        TEXT,
  author_id   BIGINT REFERENCES figures(id),
  year        INT,
  description TEXT,
  importance  INT
);
CREATE INDEX IF NOT EXISTS idx_documents_type ON historical_documents(type);

CREATE TABLE IF NOT EXISTS document_excerpts (
  id              BIGSERIAL PRIMARY KEY,
  document_id     BIGINT REFERENCES historical_documents(id),
  title           TEXT,
  original_hanja  TEXT,
  translation_ko  TEXT,
  commentary      TEXT,
  exam_relevance  TEXT,
  sort_order      INT
);

CREATE TABLE IF NOT EXISTS historical_events (
  id          BIGSERIAL PRIMARY KEY,
  era_id      BIGINT REFERENCES eras(id),
  dynasty_id  BIGINT REFERENCES dynasties(id),
  name_ko     TEXT NOT NULL,
  name_hanja  TEXT,
  year        INT,
  month       INT,
  day         INT,
  category    TEXT,
  location    TEXT,
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6),
  description TEXT,
  importance  INT
);
CREATE INDEX IF NOT EXISTS idx_events_year ON historical_events(year);
CREATE INDEX IF NOT EXISTS idx_events_era ON historical_events(era_id);

CREATE TABLE IF NOT EXISTS event_figures (
  event_id   BIGINT REFERENCES historical_events(id),
  figure_id  BIGINT REFERENCES figures(id),
  role       TEXT,
  PRIMARY KEY (event_id, figure_id)
);

CREATE TABLE IF NOT EXISTS map_territories (
  id                BIGSERIAL PRIMARY KEY,
  era_id            BIGINT REFERENCES eras(id),
  dynasty_id        BIGINT REFERENCES dynasties(id),
  period_year       INT,
  territory_geojson JSONB,
  description       TEXT
);

CREATE TABLE IF NOT EXISTS historical_terms (
  id             BIGSERIAL PRIMARY KEY,
  era_id         BIGINT REFERENCES eras(id),
  term_ko        TEXT NOT NULL,
  term_hanja     TEXT,
  meaning        TEXT NOT NULL,
  example        TEXT,
  exam_relevance TEXT
);

-- ── 6. 컴퓨터일반 특화 ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS cs_concepts (
  id               BIGSERIAL PRIMARY KEY,
  domain           TEXT NOT NULL,
  name             TEXT NOT NULL,
  description      TEXT,
  formula          TEXT,
  example          TEXT,
  exam_appeared_in TEXT,
  importance       INT
);
CREATE INDEX IF NOT EXISTS idx_cs_concepts_domain ON cs_concepts(domain);

CREATE TABLE IF NOT EXISTS cs_concept_progress (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users ON DELETE CASCADE,
  concept_id      BIGINT REFERENCES cs_concepts(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'new',
  familiarity     INT DEFAULT 0,
  repetitions     INT DEFAULT 0,
  ease_factor     FLOAT DEFAULT 2.5,
  interval        INT DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at  TIMESTAMPTZ,
  mastery_level   INT DEFAULT 0,
  UNIQUE(user_id, concept_id)
);
CREATE INDEX IF NOT EXISTS idx_cs_concept_progress_review ON cs_concept_progress(next_review_at);

CREATE TABLE IF NOT EXISTS cs_algorithms (
  id               BIGSERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  category         TEXT,
  time_complexity  TEXT,
  space_complexity TEXT,
  pseudocode       TEXT,
  description      TEXT
);

CREATE TABLE IF NOT EXISTS cs_protocols (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  osi_layer   SMALLINT,
  rfc_number  TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS cs_code_traces (
  id                  BIGSERIAL PRIMARY KEY,
  title               TEXT NOT NULL,
  language            TEXT,
  source_code         TEXT NOT NULL,
  trace_steps         JSONB,
  description         TEXT,
  related_concept_id  BIGINT REFERENCES cs_concepts(id)
);

-- ── 7. 정보보호론 특화 ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS crypto_algorithms (
  id               BIGSERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL,
  block_size       INT,
  key_size_options INT[],
  output_size      INT,
  rounds           INT,
  structure        TEXT,
  base_problem     TEXT,
  security_status  TEXT,
  description      TEXT
);

CREATE TABLE IF NOT EXISTS security_protocols (
  id                       BIGSERIAL PRIMARY KEY,
  name                     TEXT NOT NULL,
  osi_layer                SMALLINT,
  rfc_number               TEXT,
  provides_confidentiality BOOLEAN,
  provides_integrity       BOOLEAN,
  provides_authentication  BOOLEAN,
  modes                    JSONB,
  components               JSONB,
  description              TEXT
);

CREATE TABLE IF NOT EXISTS attack_techniques (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  target_layer    TEXT,
  mechanism       TEXT,
  defense_methods TEXT[],
  example         TEXT
);

CREATE TABLE IF NOT EXISTS law_articles (
  id                  BIGSERIAL PRIMARY KEY,
  law_name            TEXT NOT NULL,
  article_number      TEXT NOT NULL,
  article_title       TEXT,
  content             TEXT NOT NULL,
  supervising_ministry TEXT,
  key_numbers         JSONB
);
CREATE INDEX IF NOT EXISTS idx_law_articles_law ON law_articles(law_name);

CREATE TABLE IF NOT EXISTS ismsp_items (
  id          BIGSERIAL PRIMARY KEY,
  area        TEXT NOT NULL,
  phase       TEXT,
  category    TEXT,
  item_code   TEXT,
  item_name   TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS access_control_models (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  policy_type TEXT,
  focus       TEXT,
  rules       JSONB,
  use_case    TEXT
);

-- ── 8. Row Level Security ──────────────────────────────────

ALTER TABLE user_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_checklist_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mini_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE idiom_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_pattern_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE cs_concept_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "자신의 데이터만 조회" ON user_views FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "자신의 데이터만 조회" ON user_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "자신의 데이터만 조회" ON user_checklist_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "자신의 데이터만 조회" ON user_mini_quiz_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "자신의 데이터만 조회" ON user_trap_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "자신의 데이터만 조회" ON vocab_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "자신의 데이터만 조회" ON idiom_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "자신의 데이터만 조회" ON grammar_pattern_views FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "자신의 데이터만 조회" ON cs_concept_progress FOR ALL USING (auth.uid() = user_id);
