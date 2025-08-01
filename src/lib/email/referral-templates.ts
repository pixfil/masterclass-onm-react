// Templates d'emails pour le système de parrainage - Masterclass ONM
import { EmailTemplatesService } from '@/lib/supabase/email-templates'
import type { CreateEmailTemplateData } from '@/lib/supabase/email-templates-types'

export const REFERRAL_EMAIL_TEMPLATES: CreateEmailTemplateData[] = [
  {
    name: 'Invitation de parrainage',
    type: 'referral_invitation',
    subject: '{{referrer.first_name}} vous invite à rejoindre la Masterclass ONM',
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .benefit-list { background: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .benefit-list li { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vous êtes invité(e) à rejoindre la Masterclass ONM</h1>
    </div>
    
    <div class="content">
      <p>Bonjour {{referral_name}},</p>
      
      <p><strong>{{referrer.first_name}} {{referrer.last_name}}</strong> vous invite à découvrir la Masterclass ONM, la plateforme de référence pour l'orthodontie neuro-musculaire.</p>
      
      {{#if personal_message}}
      <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #6366f1; margin: 20px 0;">
        <p><em>"{{personal_message}}"</em></p>
        <p style="text-align: right;">- {{referrer.first_name}}</p>
      </div>
      {{/if}}
      
      <h3>Pourquoi rejoindre la Masterclass ONM ?</h3>
      <div class="benefit-list">
        <ul>
          <li>✅ Accès à des formations exclusives en orthodontie neuro-musculaire</li>
          <li>✅ Communauté d'experts et de praticiens passionnés</li>
          <li>✅ Ressources et outils pratiques pour votre cabinet</li>
          <li>✅ Webinaires et cas cliniques détaillés</li>
          <li>✅ <strong>Réduction de {{discount_percentage}}% sur votre première formation</strong></li>
        </ul>
      </div>
      
      <p>Profitez de cette offre exclusive réservée aux invités de nos membres.</p>
      
      <div style="text-align: center;">
        <a href="{{referral_link}}" class="button">Accepter l'invitation</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Cette invitation est valable pendant 30 jours. Le code promo sera automatiquement appliqué lors de votre inscription.
      </p>
    </div>
    
    <div class="footer">
      <p>© 2024 Masterclass ONM - L'excellence en orthodontie neuro-musculaire</p>
      <p>Cet email vous a été envoyé suite à l'invitation de {{referrer.first_name}} {{referrer.last_name}}</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: [
      { name: 'referrer', type: 'object', description: 'Informations du parrain', required: true },
      { name: 'referral_name', type: 'string', description: 'Nom du filleul', required: true },
      { name: 'referral_email', type: 'string', description: 'Email du filleul', required: true },
      { name: 'personal_message', type: 'string', description: 'Message personnel du parrain', required: false },
      { name: 'referral_link', type: 'string', description: 'Lien d\'inscription avec code', required: true },
      { name: 'discount_percentage', type: 'number', description: 'Pourcentage de réduction', required: true }
    ],
    auto_send: true,
    is_active: true
  },
  
  {
    name: 'Confirmation de parrainage accepté',
    type: 'referral_accepted',
    subject: '🎉 {{referral_name}} a accepté votre invitation !',
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
    .reward-box { background: #fef3c7; border: 2px solid #fbbf24; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Félicitations ! Votre invitation a été acceptée</h1>
    </div>
    
    <div class="content">
      <p>Bonjour {{referrer.first_name}},</p>
      
      <p>Excellente nouvelle ! <strong>{{referral_name}}</strong> vient d'accepter votre invitation et a rejoint la communauté Masterclass ONM.</p>
      
      <div class="reward-box">
        <h3>🎁 Votre récompense</h3>
        <p>En remerciement, vous recevez :</p>
        <p style="font-size: 24px; font-weight: bold; color: #059669;">{{reward_amount}}€ de crédit formation</p>
        <p>À utiliser sur votre prochaine formation</p>
      </div>
      
      <h3>Prochaines étapes</h3>
      <ul>
        <li>Votre crédit est automatiquement ajouté à votre compte</li>
        <li>Il sera appliqué lors de votre prochain achat</li>
        <li>Continuez à parrainer pour cumuler des crédits !</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{dashboard_link}}" class="button">Voir mon tableau de bord</a>
      </div>
      
      <p style="background: #f3f4f6; padding: 15px; border-radius: 5px;">
        <strong>💡 Astuce :</strong> Plus vous parrainez, plus vous gagnez ! Chaque nouveau membre vous rapporte {{reward_amount}}€ de crédit formation.
      </p>
    </div>
    
    <div class="footer">
      <p>© 2024 Masterclass ONM - Merci de faire grandir notre communauté</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: [
      { name: 'referrer', type: 'object', description: 'Informations du parrain', required: true },
      { name: 'referral_name', type: 'string', description: 'Nom du filleul', required: true },
      { name: 'reward_amount', type: 'number', description: 'Montant du crédit gagné', required: true },
      { name: 'dashboard_link', type: 'string', description: 'Lien vers le tableau de bord', required: true }
    ],
    auto_send: true,
    is_active: true
  },
  
  {
    name: 'Bienvenue au filleul',
    type: 'referral_welcome',
    subject: 'Bienvenue dans la Masterclass ONM ! Votre réduction exclusive vous attend',
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
    .discount-box { background: #ede9fe; border: 2px solid #8b5cf6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue dans la Masterclass ONM !</h1>
    </div>
    
    <div class="content">
      <p>Bonjour {{user.first_name}},</p>
      
      <p>Nous sommes ravis de vous accueillir dans la communauté Masterclass ONM ! Vous avez été invité(e) par <strong>{{referrer.first_name}} {{referrer.last_name}}</strong>, et nous avons une surprise pour vous.</p>
      
      <div class="discount-box">
        <h3>🎉 Votre avantage exclusif</h3>
        <p style="font-size: 36px; font-weight: bold; color: #8b5cf6; margin: 10px 0;">{{discount_percentage}}% DE RÉDUCTION</p>
        <p>Sur votre première formation</p>
        <p style="font-size: 14px; color: #6b7280;">Code automatiquement appliqué à votre compte</p>
      </div>
      
      <h3>Découvrez ce qui vous attend :</h3>
      <ul>
        <li><strong>Formations d'excellence</strong> : Accédez aux meilleures formations en orthodontie neuro-musculaire</li>
        <li><strong>Experts reconnus</strong> : Apprenez auprès des meilleurs praticiens du domaine</li>
        <li><strong>Communauté active</strong> : Échangez avec des confrères passionnés</li>
        <li><strong>Ressources exclusives</strong> : Protocoles, cas cliniques et outils pratiques</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{formations_link}}" class="button">Découvrir les formations</a>
      </div>
      
      <p style="background: #f3f4f6; padding: 15px; border-radius: 5px;">
        <strong>💡 Conseil :</strong> Commencez par notre formation "Introduction à l'ONM" pour découvrir les fondamentaux de l'orthodontie neuro-musculaire.
      </p>
    </div>
    
    <div class="footer">
      <p>© 2024 Masterclass ONM - Votre parcours vers l'excellence commence ici</p>
      <p>Des questions ? Contactez-nous à support@masterclass-onm.fr</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: [
      { name: 'user', type: 'object', description: 'Informations du nouveau membre', required: true },
      { name: 'referrer', type: 'object', description: 'Informations du parrain', required: true },
      { name: 'discount_percentage', type: 'number', description: 'Pourcentage de réduction', required: true },
      { name: 'formations_link', type: 'string', description: 'Lien vers les formations', required: true }
    ],
    auto_send: true,
    is_active: true
  },
  
  {
    name: 'Rappel invitation en attente',
    type: 'referral_reminder',
    subject: 'Rappel : Votre invitation à {{referral_name}} expire bientôt',
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
    .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Votre invitation expire dans {{days_remaining}} jours</h1>
    </div>
    
    <div class="content">
      <p>Bonjour {{referrer.first_name}},</p>
      
      <p>Votre invitation à <strong>{{referral_name}}</strong> pour rejoindre la Masterclass ONM n'a pas encore été acceptée.</p>
      
      <div class="warning-box">
        <p><strong>⏰ Attention :</strong> Cette invitation expirera dans {{days_remaining}} jours.</p>
      </div>
      
      <p>Souhaitez-vous relancer {{referral_name}} ? Un simple message peut faire la différence !</p>
      
      <div style="text-align: center;">
        <a href="{{resend_link}}" class="button">Renvoyer l'invitation</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Si {{referral_name}} n'est plus intéressé(e), vous pouvez inviter quelqu'un d'autre depuis votre espace parrainage.
      </p>
    </div>
  </div>
</body>
</html>
    `,
    variables: [
      { name: 'referrer', type: 'object', description: 'Informations du parrain', required: true },
      { name: 'referral_name', type: 'string', description: 'Nom du filleul', required: true },
      { name: 'days_remaining', type: 'number', description: 'Jours restants', required: true },
      { name: 'resend_link', type: 'string', description: 'Lien pour renvoyer', required: true }
    ],
    auto_send: true,
    is_active: true,
    send_delay: 20160 // 14 jours en minutes
  },
  
  {
    name: 'Félicitations parrain VIP',
    type: 'referral_milestone',
    subject: '🏆 Félicitations ! Vous êtes maintenant Parrain VIP',
    content: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
    .achievement-box { background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .benefits-list { background: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Vous êtes maintenant Parrain VIP !</h1>
    </div>
    
    <div class="content">
      <p>Bonjour {{referrer.first_name}},</p>
      
      <div class="achievement-box">
        <h2>FÉLICITATIONS !</h2>
        <p style="font-size: 20px;">Vous avez parrainé <strong>{{referral_count}}</strong> nouveaux membres</p>
        <p>Vous faites maintenant partie du cercle exclusif des Parrains VIP</p>
      </div>
      
      <h3>Vos nouveaux avantages VIP :</h3>
      <div class="benefits-list">
        <ul>
          <li>✨ <strong>Bonus doublé</strong> : {{new_reward_amount}}€ par parrainage (au lieu de {{old_reward_amount}}€)</li>
          <li>🎯 <strong>Accès prioritaire</strong> aux nouvelles formations</li>
          <li>🎁 <strong>Formation gratuite</strong> tous les 10 parrainages</li>
          <li>💎 <strong>Badge VIP</strong> sur votre profil</li>
          <li>🤝 <strong>Invitations illimitées</strong> actives simultanément</li>
        </ul>
      </div>
      
      <p>Continuez à faire grandir notre communauté et débloquez encore plus d'avantages !</p>
    </div>
    
    <div class="footer">
      <p>© 2024 Masterclass ONM - Merci d'être un ambassadeur de notre communauté</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: [
      { name: 'referrer', type: 'object', description: 'Informations du parrain', required: true },
      { name: 'referral_count', type: 'number', description: 'Nombre de parrainages', required: true },
      { name: 'new_reward_amount', type: 'number', description: 'Nouveau montant de récompense', required: true },
      { name: 'old_reward_amount', type: 'number', description: 'Ancien montant de récompense', required: true }
    ],
    auto_send: true,
    is_active: true
  }
]

// Fonction pour initialiser les templates de parrainage
export async function initializeReferralTemplates() {
  try {
    console.log('Initialisation des templates d\'email de parrainage...')
    
    for (const template of REFERRAL_EMAIL_TEMPLATES) {
      // Vérifier si le template existe déjà
      const existing = await EmailTemplatesService.getEmailTemplateByType(template.type)
      
      if (!existing) {
        await EmailTemplatesService.createEmailTemplate(template)
        console.log(`Template créé : ${template.name}`)
      } else {
        console.log(`Template déjà existant : ${template.name}`)
      }
    }
    
    console.log('Templates de parrainage initialisés avec succès')
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des templates:', error)
  }
}

// Fonctions utilitaires pour envoyer les emails de parrainage
export const ReferralEmails = {
  // Envoyer une invitation de parrainage
  async sendInvitation(data: {
    referrer: any
    referral_name: string
    referral_email: string
    personal_message?: string
    referral_code: string
  }) {
    const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/inscription?code=${data.referral_code}`
    
    return EmailTemplatesService.sendAutomaticEmail(
      'referral_invitation',
      data.referral_email,
      {
        referrer: data.referrer,
        referral_name: data.referral_name,
        referral_email: data.referral_email,
        personal_message: data.personal_message,
        referral_link: referralLink,
        discount_percentage: 10
      }
    )
  },
  
  // Notifier le parrain qu'une invitation a été acceptée
  async notifyReferralAccepted(data: {
    referrer: any
    referral_name: string
    reward_amount: number
  }) {
    return EmailTemplatesService.sendAutomaticEmail(
      'referral_accepted',
      data.referrer.email,
      {
        referrer: data.referrer,
        referral_name: data.referral_name,
        reward_amount: data.reward_amount,
        dashboard_link: `${process.env.NEXT_PUBLIC_SITE_URL}/parrainage`
      }
    )
  },
  
  // Envoyer un email de bienvenue au filleul
  async sendWelcomeToReferral(data: {
    user: any
    referrer: any
    discount_percentage: number
  }) {
    return EmailTemplatesService.sendAutomaticEmail(
      'referral_welcome',
      data.user.email,
      {
        user: data.user,
        referrer: data.referrer,
        discount_percentage: data.discount_percentage,
        formations_link: `${process.env.NEXT_PUBLIC_SITE_URL}/formations`
      }
    )
  },
  
  // Envoyer un rappel pour une invitation en attente
  async sendReminder(data: {
    referrer: any
    referral_name: string
    referral_email: string
    days_remaining: number
    referral_id: string
  }) {
    return EmailTemplatesService.sendAutomaticEmail(
      'referral_reminder',
      data.referrer.email,
      {
        referrer: data.referrer,
        referral_name: data.referral_name,
        days_remaining: data.days_remaining,
        resend_link: `${process.env.NEXT_PUBLIC_SITE_URL}/parrainage?resend=${data.referral_id}`
      }
    )
  },
  
  // Féliciter un parrain VIP
  async sendMilestoneAchieved(data: {
    referrer: any
    referral_count: number
    new_reward_amount: number
    old_reward_amount: number
  }) {
    return EmailTemplatesService.sendAutomaticEmail(
      'referral_milestone',
      data.referrer.email,
      {
        referrer: data.referrer,
        referral_count: data.referral_count,
        new_reward_amount: data.new_reward_amount,
        old_reward_amount: data.old_reward_amount
      }
    )
  }
}