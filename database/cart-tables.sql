-- Création des tables pour le système de panier - Masterclass ONM

-- Table des paniers
CREATE TABLE IF NOT EXISTS carts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id text, -- ID de session pour les utilisateurs non connectés
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    expires_at timestamptz DEFAULT (now() + interval '24 hours') NOT NULL,
    
    -- Contraintes
    CONSTRAINT cart_identifier_check CHECK (
        (user_id IS NOT NULL AND session_id IS NULL) OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    )
);

-- Table des articles dans le panier
CREATE TABLE IF NOT EXISTS cart_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id uuid REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
    session_id uuid REFERENCES formation_sessions(id) ON DELETE CASCADE NOT NULL,
    quantity integer DEFAULT 1 NOT NULL CHECK (quantity > 0),
    price_at_time decimal(10,2) NOT NULL CHECK (price_at_time >= 0),
    added_at timestamptz DEFAULT now() NOT NULL,
    
    -- Un seul article par session par panier
    UNIQUE(cart_id, session_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_carts_expires_at ON carts(expires_at);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);

-- Fonction pour nettoyer automatiquement les paniers expirés
CREATE OR REPLACE FUNCTION cleanup_expired_carts()
RETURNS void AS $$
BEGIN
    DELETE FROM carts WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatically updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_carts_updated_at 
    BEFORE UPDATE ON carts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Politique pour les paniers : utilisateur peut voir/modifier ses propres paniers
CREATE POLICY "Users can view their own carts" ON carts
    FOR ALL USING (
        auth.uid() = user_id OR 
        (user_id IS NULL AND session_id IS NOT NULL)
    );

-- Politique pour les articles du panier : via le panier
CREATE POLICY "Users can manage their cart items" ON cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND (
                carts.user_id = auth.uid() OR 
                (carts.user_id IS NULL AND carts.session_id IS NOT NULL)
            )
        )
    );

-- Accès public pour les utilisateurs anonymes (avec session_id)
CREATE POLICY "Anonymous users can manage their carts" ON carts
    FOR ALL USING (user_id IS NULL AND session_id IS NOT NULL);

CREATE POLICY "Anonymous users can manage their cart items" ON cart_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM carts 
            WHERE carts.id = cart_items.cart_id 
            AND carts.user_id IS NULL 
            AND carts.session_id IS NOT NULL
        )
    );