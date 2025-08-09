-- Add migration script here
-- Tabela de Despesas
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY,
    description TEXT NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    amount DOUBLE PRECISION NOT NULL,
    due_date DATE NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    payment_date DATE,
    amount DOUBLE PRECISION NOT NULL,
    method TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
