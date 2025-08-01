"use client"

import React, { useRef } from 'react'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import { Award, Download, Share2 } from 'lucide-react'

interface BadgeONMProps {
  userName: string
  certificationDate: string
  certificationNumber: string
  profileUrl: string
}

export default function BadgeONM({ userName, certificationDate, certificationNumber, profileUrl }: BadgeONMProps) {
  const badgeRef = useRef<HTMLDivElement>(null)
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('')

  React.useEffect(() => {
    // Générer le QR code
    QRCode.toDataURL(profileUrl, {
      width: 120,
      margin: 1,
      color: {
        dark: '#1e40af',
        light: '#ffffff'
      }
    }).then(url => {
      setQrCodeUrl(url)
    })
  }, [profileUrl])

  const downloadBadge = async () => {
    if (!badgeRef.current) return

    const canvas = await html2canvas(badgeRef.current, {
      backgroundColor: '#ffffff',
      scale: 2
    })

    const link = document.createElement('a')
    link.download = `badge-onm-${certificationNumber}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const downloadSignature = () => {
    const signatureHTML = `
      <table style="font-family: Arial, sans-serif; color: #333;">
        <tr>
          <td style="padding-right: 20px;">
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 80px; height: 80px;">
          </td>
          <td>
            <div style="font-weight: bold; font-size: 16px; color: #1e40af;">${userName}</div>
            <div style="font-size: 14px; color: #666; margin-top: 4px;">Certifié ONM</div>
            <div style="font-size: 12px; color: #999; margin-top: 2px;">N° ${certificationNumber}</div>
            <div style="font-size: 12px; color: #999;">Depuis le ${new Date(certificationDate).toLocaleDateString('fr-FR')}</div>
          </td>
        </tr>
      </table>
    `

    const blob = new Blob([signatureHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'signature-email-onm.html'
    link.href = url
    link.click()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Badge Certifié ONM</h3>
      
      {/* Badge visuel */}
      <div ref={badgeRef} className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl mb-6">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Award className="w-12 h-12 text-white" />
          </div>
          
          {/* Titre */}
          <h4 className="text-2xl font-bold text-gray-900 mb-2">Praticien Certifié ONM</h4>
          
          {/* Nom */}
          <p className="text-lg text-gray-700 mb-4">{userName}</p>
          
          {/* QR Code */}
          {qrCodeUrl && (
            <div className="flex justify-center mb-4">
              <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
            </div>
          )}
          
          {/* Infos certification */}
          <div className="text-sm text-gray-600">
            <p>Certification N° {certificationNumber}</p>
            <p>Délivrée le {new Date(certificationDate).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={downloadBadge}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Télécharger Badge
        </button>
        
        <button
          onClick={downloadSignature}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Signature Email
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium mb-2">Comment utiliser :</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Badge : À afficher sur votre site web ou réseaux sociaux</li>
          <li>QR Code : Renvoie vers votre profil vérifié ONM</li>
          <li>Signature : À intégrer dans vos emails professionnels</li>
        </ul>
      </div>
    </div>
  )
}