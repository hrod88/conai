-- Columnas de enriquecimiento en productos
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_images text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications jsonb;

-- Tabla de preguntas por producto
CREATE TABLE IF NOT EXISTS product_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid,
  user_email text,
  question text NOT NULL,
  answer text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_questions_select" ON product_questions FOR SELECT USING (true);
CREATE POLICY "product_questions_insert" ON product_questions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
