-- Scripts SQL pour créer toutes les nouvelles tables admin
-- À exécuter dans Supabase

-- 1. Table des comptes admin
CREATE TABLE IF NOT EXISTS admin_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES admin_accounts(id),
    CONSTRAINT admin_accounts_status_check CHECK (status IN ('active', 'inactive', 'suspended')),
    CONSTRAINT admin_accounts_role_check CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer'))
);

-- 2. Table des agences
CREATE TABLE IF NOT EXISTS agencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT agencies_status_check CHECK (status IN ('active', 'inactive'))
);

-- 3. Modification de la table agents pour ajouter agency_id
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;

-- 4. Table des modèles d'emails
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    recipient_type VARCHAR(20) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT email_templates_type_check CHECK (type IN ('contact', 'estimation', 'newsletter', 'notification')),
    CONSTRAINT email_templates_recipient_type_check CHECK (recipient_type IN ('client', 'agent', 'admin'))
);

-- 5. Table des logs d'emails
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    html_content TEXT,
    text_content TEXT,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0,
    CONSTRAINT email_logs_status_check CHECK (status IN ('pending', 'sent', 'failed', 'bounced'))
);

-- 6. Table des notifications/logs d'actions
CREATE TABLE IF NOT EXISTS action_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20) DEFAULT 'blue',
    user_id UUID,
    user_name VARCHAR(255),
    entity_type VARCHAR(50),
    entity_id UUID,
    entity_name VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT action_notifications_type_check CHECK (type IN ('property_published', 'agent_created', 'estimation_received', 'contact_received', 'user_registered', 'property_sold', 'property_rented')),
    CONSTRAINT action_notifications_color_check CHECK (color IN ('blue', 'green', 'yellow', 'red', 'purple', 'gray'))
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON admin_accounts(email);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_status ON admin_accounts(status);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(status);
CREATE INDEX IF NOT EXISTS idx_agents_agency_id ON agents(agency_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type_recipient ON email_templates(type, recipient_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_notifications_created_at ON action_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_notifications_type ON action_notifications(type);
CREATE INDEX IF NOT EXISTS idx_action_notifications_is_read ON action_notifications(is_read);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_accounts_updated_at BEFORE UPDATE ON admin_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer les modèles d'email par défaut
INSERT INTO email_templates (name, type, recipient_type, subject, html_content, text_content, variables) VALUES
('Contact - Notification Agent', 'contact', 'agent', 'Nouvelle demande de contact - {{property_title}}', 
 '<h2>Nouvelle demande de contact</h2><p>Bonjour {{agent_name}},</p><p>Vous avez reçu une nouvelle demande de contact pour le bien : <strong>{{property_title}}</strong></p><p><strong>Contact :</strong><br>{{client_name}}<br>{{client_email}}<br>{{client_phone}}</p><p><strong>Message :</strong><br>{{message}}</p>', 
 'Nouvelle demande de contact\n\nBonjour {{agent_name}},\n\nVous avez reçu une nouvelle demande de contact pour le bien : {{property_title}}\n\nContact :\n{{client_name}}\n{{client_email}}\n{{client_phone}}\n\nMessage :\n{{message}}',
 '{"agent_name": "Nom de l''agent", "property_title": "Titre du bien", "client_name": "Nom du client", "client_email": "Email du client", "client_phone": "Téléphone du client", "message": "Message du client"}'),

('Contact - Confirmation Client', 'contact', 'client', 'Confirmation de votre demande de contact - Initiative Immobilier', 
 '<h2>Confirmation de votre demande</h2><p>Bonjour {{client_name}},</p><p>Nous avons bien reçu votre demande de contact concernant le bien : <strong>{{property_title}}</strong></p><p>Notre équipe vous contactera dans les plus brefs délais.</p><p>Cordialement,<br>L''équipe Initiative Immobilier</p>', 
 'Confirmation de votre demande\n\nBonjour {{client_name}},\n\nNous avons bien reçu votre demande de contact concernant le bien : {{property_title}}\n\nNotre équipe vous contactera dans les plus brefs délais.\n\nCordialement,\nL''équipe Initiative Immobilier',
 '{"client_name": "Nom du client", "property_title": "Titre du bien"}'),

('Estimation - Notification Agent', 'estimation', 'agent', 'Nouvelle demande d''estimation - {{city}}', 
 '<h2>Nouvelle demande d''estimation</h2><p>Bonjour {{agent_name}},</p><p>Vous avez reçu une nouvelle demande d''estimation :</p><p><strong>Contact :</strong><br>{{client_name}}<br>{{client_email}}<br>{{client_phone}}</p><p><strong>Bien :</strong><br>Type : {{property_type}}<br>Ville : {{city}}<br>Surface : {{surface}} m²<br>Pièces : {{rooms}}</p><p><strong>Message :</strong><br>{{message}}</p>', 
 'Nouvelle demande d''estimation\n\nBonjour {{agent_name}},\n\nVous avez reçu une nouvelle demande d''estimation :\n\nContact :\n{{client_name}}\n{{client_email}}\n{{client_phone}}\n\nBien :\nType : {{property_type}}\nVille : {{city}}\nSurface : {{surface}} m²\nPièces : {{rooms}}\n\nMessage :\n{{message}}',
 '{"agent_name": "Nom de l''agent", "client_name": "Nom du client", "client_email": "Email du client", "client_phone": "Téléphone du client", "property_type": "Type de bien", "city": "Ville", "surface": "Surface", "rooms": "Nombre de pièces", "message": "Message du client"}'),

('Estimation - Confirmation Client', 'estimation', 'client', 'Confirmation de votre demande d''estimation - Initiative Immobilier', 
 '<h2>Confirmation de votre demande d''estimation</h2><p>Bonjour {{client_name}},</p><p>Nous avons bien reçu votre demande d''estimation pour votre bien à {{city}}.</p><p>Un de nos experts vous contactera rapidement pour organiser une visite et vous fournir une estimation gratuite et sans engagement.</p><p>Cordialement,<br>L''équipe Initiative Immobilier</p>', 
 'Confirmation de votre demande d''estimation\n\nBonjour {{client_name}},\n\nNous avons bien reçu votre demande d''estimation pour votre bien à {{city}}.\n\nUn de nos experts vous contactera rapidement pour organiser une visite et vous fournir une estimation gratuite et sans engagement.\n\nCordialement,\nL''équipe Initiative Immobilier',
 '{"client_name": "Nom du client", "city": "Ville"}');

-- Insérer votre compte admin (remplacez l'email par le vôtre)
INSERT INTO admin_accounts (email, name, role, status) VALUES
('votre-email@example.com', 'Administrateur Principal', 'super_admin', 'active')
ON CONFLICT (email) DO NOTHING;