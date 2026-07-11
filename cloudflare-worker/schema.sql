-- driverjo D1 schema
-- Stores centers / center-join-requests / governorates / areas that used to live in Firebase RTDB.
-- Each row keeps its full record as a JSON blob in `data` (mirrors the old Firebase {id: {...fields}} shape),
-- plus a couple of columns pulled out for indexing/filtering (status, governorate_id).

CREATE TABLE IF NOT EXISTS governorates (
  id         TEXT PRIMARY KEY,
  data       TEXT NOT NULL,      -- JSON: { name, archived? }
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS areas (
  id              TEXT PRIMARY KEY,
  governorate_id  TEXT NOT NULL,
  data            TEXT NOT NULL, -- JSON: { governorateId, name, archived? }
  updated_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_areas_governorate ON areas(governorate_id);

CREATE TABLE IF NOT EXISTS centers (
  id         TEXT PRIMARY KEY,
  data       TEXT NOT NULL,      -- JSON: full center record (name, address, lat/lng, schedule, promoted, ...)
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS center_requests (
  id         TEXT PRIMARY KEY,
  status     TEXT NOT NULL DEFAULT 'pending',
  data       TEXT NOT NULL,      -- JSON: full request record
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_requests_status ON center_requests(status);
