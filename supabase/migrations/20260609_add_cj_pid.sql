-- Agrega columna para vincular productos conAI con productos de CJ Dropshipping
alter table products add column if not exists cj_pid text;
