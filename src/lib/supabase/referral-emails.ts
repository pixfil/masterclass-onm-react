// Service de modèles d'emails pour le système de parrainage - Masterclass ONM
import { EmailTemplatesService } from './email-templates'
import type { EmailTemplate, CreateEmailTemplateData } from './email-templates-types'

export class ReferralEmailTemplates {
  // =============================================================================
  // MODÈLES D'EMAILS PRÉDÉFINIS
  // =============================================================================

  /**
   * Modèle pour l'invitation de parrainage
   */
  static readonly REFERRAL_INVITATION_TEMPLATE: CreateEmailTemplateData = {
    name: 'Invitation de Parrainage ONM',
    type: 'referral_invitation',
    subject: '{{referrer.first_name}} vous invite à découvrir la Masterclass ONM',
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
    .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .benefit-item { display: flex; align-items: start; margin-bottom: 15px; }
    .benefit-icon { width: 24px; height: 24px; margin-right: 10px; fill: #667eea; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vous êtes invité(e) à rejoindre la Masterclass ONM!</h1>
    </div>
    
    <div class="content">
      <p>Bonjour {{referee_name}},</p>
      
      <p><strong>{{referrer.first_name}} {{referrer.last_name}}</strong>, orthodontiste passionné(e) par l'approche neuro-musculaire, 
      vous invite à découvrir la Masterclass ONM, la première plateforme de formation dédiée à l'orthodontie neuro-musculaire.</p>
      
      {{#if referrer.personal_message}}
      <div style="background: #e8f0fe; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
        <p><strong>Message personnel de {{referrer.first_name}} :</strong></p>
        <p style="font-style: italic;">{{referrer.personal_message}}</p>
      </div>
      {{/if}}
      
      <div class="benefits">
        <h3>🎁 Votre avantage exclusif</h3>
        <p>En rejoignant via cette invitation, vous bénéficiez de :</p>
        <ul>
          <li><strong>10% de réduction</strong> sur votre première formation</li>
          <li>Accès gratuit à des ressources exclusives</li>
          <li>Support prioritaire de notre équipe</li>
        </ul>
      </div>
      
      <h3>Pourquoi rejoindre la Masterclass ONM ?</h3>
      
      <div class="benefit-item">
        <span class="benefit-icon">📚</span>
        <div>
          <strong>Formations complètes</strong><br>
          Plus de 50 heures de contenu vidéo par des experts reconnus
        </div>
      </div>
      
      <div class="benefit-item">
        <span class="benefit-icon">🔬</span>
        <div>
          <strong>Cas cliniques réels</strong><br>
          Apprenez avec des cas pratiques documentés et analysés
        </div>
      </div>
      
      <div class="benefit-item">
        <span class="benefit-icon">🎓</span>
        <div>
          <strong>Certifications professionnelles</strong><br>
          Obtenez des certifications reconnues dans le domaine ONM
        </div>
      </div>
      
      <div class="benefit-item">
        <span class="benefit-icon">👥</span>
        <div>
          <strong>Communauté active</strong><br>
          Échangez avec plus de {{total_members}} praticiens ONM
        </div>
      </div>
      
      <center>
        <a href="{{invitation_link}}" class="button">Accepter l'invitation</a>
      </center>
      
      <p><small>Cette invitation est valable pendant 30 jours. Après cette période, vous pourrez toujours vous inscrire 
      mais sans les avantages exclusifs.</small></p>
    </div>
    
    <div class="footer">
      <p>© 2024 Masterclass ONM - Tous droits réservés</p>
      <p>Cet email vous a été envoyé suite à l'invitation de {{referrer.first_name}} {{referrer.last_name}}</p>
      <p>Si vous ne souhaitez pas recevoir ce type d'invitation, 
      <a href="{{unsubscribe_link}}">cliquez ici</a></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: [
      { name: 'referee_name', type: 'text', required: true, description: 'Nom du filleul' },
      { name: 'referrer', type: 'object', required: true, description: 'Informations du parrain' },
      { name: 'invitation_link', type: 'text', required: true, description: 'Lien d\'invitation unique' },
      { name: 'total_members', type: 'number', required: false, description: 'Nombre total de membres' },
      { name: 'unsubscribe_link', type: 'text', required: true, description: 'Lien de désinscription' }
    ],
    is_active: true,
    auto_send: true,
    send_delay: 0
  }

  /**
   * Modèle pour la confirmation au parrain
   */
  static readonly REFERRAL_SENT_CONFIRMATION: CreateEmailTemplateData = {
    name: 'Confirmation d\'envoi de parrainage',
    type: 'referral_sent_confirmation',
    subject: 'Votre invitation a bien été envoyée',
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .status-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #48bb78; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Invitation envoyée avec succès!</h1>
    </div>
    
    <div class="content">
      <p>Bonjour {{referrer.first_name}},</p>
      
      <p>Votre invitation de parrainage a bien été envoyée à <strong>{{referee_email}}</strong>.</p>
      
      <div class="status-card">
        <h3>📧 Statut de l'invitation</h3>
        <ul>
          <li>Email envoyé le : {{sent_date}}</li>
          <li>Validité : 30 jours</li>
          <li>Code de parrainage : <strong>{{referral_code}}</strong></li>
        </ul>
      </div>
      
      <h3>Et maintenant ?</h3>
      <p>Votre filleul recevra un email avec votre invitation personnalisée. 
      S'il s'inscrit via votre lien de parrainage :</p>
      
      <ul>
        <li>✨ Il bénéficiera de <strong>10% de réduction</strong> sur sa première formation</li>
        <li>🎁 Vous recevrez <strong>50 points de récompense</strong> dans votre compte</li>
        <li>🏆 Vous débloquerez le badge "Ambassadeur" après 3 parrainages réussis</li>
      </ul>
      
      <p>Vous pouvez suivre le statut de toutes vos invitations dans votre 
      <a href="{{dashboard_link}}">espace parrainage</a>.</p>
      
      <p>Merci de faire grandir la communauté ONM!</p>
      
      <p>L'équipe Masterclass ONM</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: [
      { name: 'referrer', type: 'object', required: true, description: 'Informations du parrain' },
      { name: 'referee_email', type: 'text', required: true, description: 'Email du filleul' },
      { name: 'sent_date', type: 'text', required: true, description: 'Date d\'envoi' },
      { name: 'referral_code', type: 'text', required: true, description: 'Code de parrainage' },
      { name: 'dashboard_link', type: 'text', required: true, description: 'Lien vers le tableau de bord' }
    ],
    is_active: true,
    auto_send: true,
    send_delay: 0
  }

  /**
   * Modèle pour la notification de parrainage réussi
   */
  static readonly REFERRAL_SUCCESS_NOTIFICATION: CreateEmailTemplateData = {
    name: 'Notification de parrainage réussi',
    type: 'referral_success',
    subject: '🎉 Félicitations! Votre filleul {{referee.first_name}} a rejoint la Masterclass ONM',
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .reward-box { background: #fff3cd; border: 1px solid #ffeeba; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat-item { text-align: center; }
    .stat-number { font-size: 36px; font-weight: bold; color: #667eea; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 Parrainage réussi!</h1>
    </div>
    
    <div class="content">
      <p>Bonjour {{referrer.first_name}},</p>
      
      <p>Excellente nouvelle! <strong>{{referee.first_name}} {{referee.last_name}}</strong> vient de s'inscrire 
      à la Masterclass ONM grâce à votre invitation.</p>
      
      <div class="reward-box">
        <h2>🎁 Votre récompense</h2>
        <p><strong>50 points</strong> ont été ajoutés à votre compte!</p>
        <p>Total de points : <strong>{{total_points}}</strong></p>
      </div>
      
      <h3>Vos statistiques de parrainage</h3>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">{{total_referrals}}</div>
          <div>Parrainages réussis</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{pending_referrals}}</div>
          <div>Invitations en attente</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{total_rewards}}€</div>
          <div>Récompenses totales</div>
        </div>
      </div>
      
      {{#if milestone_reached}}
      <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>🏆 Nouveau jalon atteint!</h3>
        <p>{{milestone_message}}</p>
      </div>
      {{/if}}
      
      <h3>Continuez à partager!</h3>
      <p>Plus vous parrainez, plus vous gagnez :</p>
      <ul>
        <li>3 parrainages : Badge "Ambassadeur Bronze" + 20€ de crédit formation</li>
        <li>5 parrainages : Badge "Ambassadeur Argent" + 50€ de crédit formation</li>
        <li>10 parrainages : Badge "Ambassadeur Or" + Formation gratuite au choix</li>
      </ul>
      
      <center>
        <a href="{{referral_dashboard_link}}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0;">
          Inviter d'autres collègues
        </a>
      </center>
    </div>
  </div>
</body>
</html>
    `,
    variables: [
      { name: 'referrer', type: 'object', required: true, description: 'Informations du parrain' },
      { name: 'referee', type: 'object', required: true, description: 'Informations du filleul' },
      { name: 'total_points', type: 'number', required: true, description: 'Total de points du parrain' },
      { name: 'total_referrals', type: 'number', required: true, description: 'Nombre total de parrainages' },
      { name: 'pending_referrals', type: 'number', required: true, description: 'Invitations en attente' },
      { name: 'total_rewards', type: 'number', required: true, description: 'Récompenses totales en euros' },
      { name: 'milestone_reached', type: 'boolean', required: false, description: 'Si un jalon a été atteint' },
      { name: 'milestone_message', type: 'text', required: false, description: 'Message du jalon atteint' },
      { name: 'referral_dashboard_link', type: 'text', required: true, description: 'Lien vers le tableau de bord' }
    ],
    is_active: true,
    auto_send: true,
    send_delay: 0
  }

  /**
   * Modèle de bienvenue pour le filleul
   */
  static readonly REFEREE_WELCOME_EMAIL: CreateEmailTemplateData = {
    name: 'Email de bienvenue filleul',
    type: 'referee_welcome',
    subject: 'Bienvenue sur la Masterclass ONM! Voici vos avantages exclusifs',
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .discount-box { background: #e8f0fe; border: 2px dashed #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .next-steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue dans la communauté ONM!</h1>
    </div>
    
    <div class="content">
      <p>Bonjour {{referee.first_name}},</p>
      
      <p>Nous sommes ravis de vous accueillir dans la Masterclass ONM! 
      Grâce à l'invitation de <strong>{{referrer.first_name}} {{referrer.last_name}}</strong>, 
      vous bénéficiez d'avantages exclusifs.</p>
      
      <div class="discount-box">
        <h2>🎁 Votre code de réduction</h2>
        <p style="font-size: 24px; font-weight: bold; color: #667eea;">{{discount_code}}</p>
        <p><strong>10% de réduction</strong> sur votre première formation</p>
        <p><small>Valable pendant 60 jours</small></p>
      </div>
      
      <div class="next-steps">
        <h3>🚀 Vos prochaines étapes</h3>
        <ol>
          <li><strong>Complétez votre profil</strong><br>
          Ajoutez vos informations professionnelles pour une expérience personnalisée</li>
          
          <li><strong>Explorez le catalogue de formations</strong><br>
          Plus de 20 formations disponibles, de l'initiation au perfectionnement</li>
          
          <li><strong>Inscrivez-vous à votre première formation</strong><br>
          N'oubliez pas d'utiliser votre code de réduction!</li>
          
          <li><strong>Rejoignez la communauté</strong><br>
          Échangez avec plus de {{total_members}} praticiens ONM</li>
        </ol>
      </div>
      
      <h3>📚 Formations recommandées pour débuter</h3>
      <ul>
        <li><strong>Introduction à l'ONM</strong> - Les bases essentielles (2 jours)</li>
        <li><strong>Diagnostic neuro-musculaire</strong> - Maîtrisez les outils (3 jours)</li>
        <li><strong>Cas cliniques débutants</strong> - Apprenez par la pratique (2 jours)</li>
      </ul>
      
      <center>
        <a href="{{dashboard_link}}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0;">
          Accéder à mon espace
        </a>
      </center>
      
      <p>Si vous avez des questions, notre équipe support est là pour vous aider : 
      <a href="mailto:support@masterclass-onm.fr">support@masterclass-onm.fr</a></p>
      
      <p>Bienvenue dans l'aventure ONM!</p>
      
      <p>L'équipe Masterclass ONM</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: [
      { name: 'referee', type: 'object', required: true, description: 'Informations du filleul' },
      { name: 'referrer', type: 'object', required: true, description: 'Informations du parrain' },
      { name: 'discount_code', type: 'text', required: true, description: 'Code de réduction' },
      { name: 'total_members', type: 'number', required: false, description: 'Nombre total de membres' },
      { name: 'dashboard_link', type: 'text', required: true, description: 'Lien vers le tableau de bord' }
    ],
    is_active: true,
    auto_send: true,
    send_delay: 5 // Envoi 5 minutes après l'inscription
  }

  /**
   * Modèle de rappel d'invitation
   */
  static readonly REFERRAL_REMINDER: CreateEmailTemplateData = {
    name: 'Rappel d\'invitation de parrainage',
    type: 'referral_reminder',
    subject: 'Rappel: {{referrer.first_name}} vous attend sur la Masterclass ONM',
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ffc107; color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .urgency-box { background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Votre invitation expire bientôt!</h1>
    </div>
    
    <div class="content">
      <p>Bonjour {{referee_name}},</p>
      
      <p>Il y a quelques jours, <strong>{{referrer.first_name}} {{referrer.last_name}}</strong> 
      vous a invité à découvrir la Masterclass ONM.</p>
      
      <div class="urgency-box">
        <p><strong>⚠️ Important :</strong> Votre invitation et ses avantages exclusifs expirent dans <strong>{{days_remaining}} jours</strong>.</p>
      </div>
      
      <h3>Ce que vous manquez :</h3>
      <ul>
        <li>✅ <strong>10% de réduction</strong> sur votre première formation (économisez jusqu'à 150€)</li>
        <li>✅ Accès à une communauté de {{total_members}} praticiens ONM</li>
        <li>✅ Formations certifiantes reconnues</li>
        <li>✅ Support prioritaire de nos experts</li>
      </ul>
      
      {{#if referrer.personal_message}}
      <div style="background: #e8f0fe; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
        <p><strong>Message de {{referrer.first_name}} :</strong></p>
        <p style="font-style: italic;">{{referrer.personal_message}}</p>
      </div>
      {{/if}}
      
      <center>
        <a href="{{invitation_link}}" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0;">
          Accepter l'invitation maintenant
        </a>
      </center>
      
      <p><small>Après expiration, vous pourrez toujours vous inscrire mais sans les avantages exclusifs du parrainage.</small></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: [
      { name: 'referee_name', type: 'text', required: true, description: 'Nom du filleul' },
      { name: 'referrer', type: 'object', required: true, description: 'Informations du parrain' },
      { name: 'days_remaining', type: 'number', required: true, description: 'Jours restants' },
      { name: 'invitation_link', type: 'text', required: true, description: 'Lien d\'invitation' },
      { name: 'total_members', type: 'number', required: false, description: 'Nombre de membres' }
    ],
    is_active: true,
    auto_send: false, // Envoi manuel ou via cron job
    send_delay: 0
  }

  // =============================================================================
  // MÉTHODES UTILITAIRES
  // =============================================================================

  /**
   * Initialise tous les modèles d'emails de parrainage
   */
  static async initializeReferralTemplates(): Promise<void> {
    const templates = [
      this.REFERRAL_INVITATION_TEMPLATE,
      this.REFERRAL_SENT_CONFIRMATION,
      this.REFERRAL_SUCCESS_NOTIFICATION,
      this.REFEREE_WELCOME_EMAIL,
      this.REFERRAL_REMINDER
    ]

    for (const template of templates) {
      try {
        // Vérifier si le template existe déjà
        const existing = await EmailTemplatesService.getEmailTemplateByType(template.type)
        
        if (!existing) {
          await EmailTemplatesService.createEmailTemplate(template)
          console.log(`✅ Template créé : ${template.name}`)
        } else {
          console.log(`ℹ️ Template existe déjà : ${template.name}`)
        }
      } catch (error) {
        console.error(`❌ Erreur création template ${template.name}:`, error)
      }
    }
  }

  /**
   * Envoie un email d'invitation de parrainage
   */
  static async sendReferralInvitation(
    referrerData: any,
    refereeEmail: string,
    refereeName: string,
    invitationLink: string,
    personalMessage?: string
  ): Promise<void> {
    const variablesData = {
      referee_name: refereeName,
      referrer: referrerData,
      invitation_link: invitationLink,
      total_members: 1500, // À récupérer dynamiquement
      unsubscribe_link: `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe`
    }

    if (personalMessage) {
      variablesData.referrer.personal_message = personalMessage
    }

    await EmailTemplatesService.sendAutomaticEmail(
      'referral_invitation',
      refereeEmail,
      variablesData,
      { user_id: referrerData.id }
    )
  }

  /**
   * Envoie une confirmation au parrain
   */
  static async sendReferralConfirmation(
    referrerData: any,
    refereeEmail: string,
    referralCode: string
  ): Promise<void> {
    const variablesData = {
      referrer: referrerData,
      referee_email: refereeEmail,
      sent_date: new Date().toLocaleDateString('fr-FR'),
      referral_code: referralCode,
      dashboard_link: `${process.env.NEXT_PUBLIC_SITE_URL}/parrainage`
    }

    await EmailTemplatesService.sendAutomaticEmail(
      'referral_sent_confirmation',
      referrerData.email,
      variablesData,
      { user_id: referrerData.id }
    )
  }

  /**
   * Envoie une notification de parrainage réussi
   */
  static async sendSuccessNotification(
    referrerData: any,
    refereeData: any,
    stats: any
  ): Promise<void> {
    const variablesData = {
      referrer: referrerData,
      referee: refereeData,
      total_points: stats.total_points,
      total_referrals: stats.total_referrals,
      pending_referrals: stats.pending_referrals,
      total_rewards: stats.total_rewards,
      milestone_reached: stats.milestone_reached || false,
      milestone_message: stats.milestone_message || '',
      referral_dashboard_link: `${process.env.NEXT_PUBLIC_SITE_URL}/parrainage`
    }

    await EmailTemplatesService.sendAutomaticEmail(
      'referral_success',
      referrerData.email,
      variablesData,
      { user_id: referrerData.id }
    )
  }

  /**
   * Envoie un email de bienvenue au filleul
   */
  static async sendRefereeWelcome(
    refereeData: any,
    referrerData: any,
    discountCode: string
  ): Promise<void> {
    const variablesData = {
      referee: refereeData,
      referrer: referrerData,
      discount_code: discountCode,
      total_members: 1500, // À récupérer dynamiquement
      dashboard_link: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
    }

    await EmailTemplatesService.sendAutomaticEmail(
      'referee_welcome',
      refereeData.email,
      variablesData,
      { user_id: refereeData.id }
    )
  }

  /**
   * Envoie un rappel d'invitation
   */
  static async sendReferralReminder(
    referrerData: any,
    refereeEmail: string,
    refereeName: string,
    invitationLink: string,
    daysRemaining: number
  ): Promise<void> {
    const variablesData = {
      referee_name: refereeName,
      referrer: referrerData,
      days_remaining: daysRemaining,
      invitation_link: invitationLink,
      total_members: 1500 // À récupérer dynamiquement
    }

    await EmailTemplatesService.sendAutomaticEmail(
      'referral_reminder',
      refereeEmail,
      variablesData
    )
  }
}

// Export pour utilisation directe
export const initializeReferralTemplates = ReferralEmailTemplates.initializeReferralTemplates.bind(ReferralEmailTemplates)
export const sendReferralInvitation = ReferralEmailTemplates.sendReferralInvitation.bind(ReferralEmailTemplates)
export const sendReferralConfirmation = ReferralEmailTemplates.sendReferralConfirmation.bind(ReferralEmailTemplates)
export const sendSuccessNotification = ReferralEmailTemplates.sendSuccessNotification.bind(ReferralEmailTemplates)
export const sendRefereeWelcome = ReferralEmailTemplates.sendRefereeWelcome.bind(ReferralEmailTemplates)
export const sendReferralReminder = ReferralEmailTemplates.sendReferralReminder.bind(ReferralEmailTemplates)