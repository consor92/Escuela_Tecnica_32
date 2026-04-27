import React, { useState } from 'react'
import Style from './Footer.module.css'
import Link from 'next/link';
import ContactModal from './ContactModal';
import { FaInstagram, FaYoutube, FaFacebook, FaMapMarkerAlt, FaBus, FaTrain, FaPhoneAlt, FaEnvelope, FaShareAlt } from 'react-icons/fa';
import config from '../../data/config.json';

export const Footer = () => {
  const { contact } = config;
  const [selectedEmail, setSelectedEmail] = useState(null);
  const googleMapsUrl = contact.google_maps_url;

  return (
    <div id="contacto" className={Style.container}>
      {selectedEmail && (
        <ContactModal 
          email={selectedEmail} 
          onClose={() => setSelectedEmail(null)} 
        />
      )}
      <div className={Style.container__msg}>
        <div className={Style.images}>
          <Link href={googleMapsUrl} target="_blank" className={Style.mapLink}>
            <div className={Style.mapOverlay}>VER EN GOOGLE MAPS</div>
          </Link>
        </div>
        <div className={Style.msg}>
          <div className={Style.contactGrid}>
            <div className={Style.contactItem}>
              <FaMapMarkerAlt className={Style.reactIcon} />
              <p className={Style.textSecondary}>
                <strong>Dirección:</strong> <Link href={googleMapsUrl} target="_blank" className={Style.link}>{contact.address}</Link>
              </p>
            </div>

            <div className={Style.contactItem}>
              <FaBus className={Style.reactIcon} />
              <p className={Style.textSecondary}>
                <strong>Colectivos:</strong> {contact.transport.colectivos}
              </p>
            </div>

            <div className={Style.contactItem}>
              <FaTrain className={Style.reactIcon} />
              <p className={Style.textSecondary}>
                <strong>Subte y Tren:</strong> {contact.transport.trenes_subtes}
              </p>
            </div>

            <div className={Style.contactItem}>
              <FaPhoneAlt className={Style.reactIcon} />
              <p className={Style.textSecondary}>
                <strong>Teléfonos:</strong> {contact.phones.map((phone, index) => (
                  <React.Fragment key={phone}>
                    <a href={`tel:+5411${phone.replace('-', '')}`} className={Style.link}>{phone}</a>
                    {index < contact.phones.length - 1 && ' / '}
                  </React.Fragment>
                ))}
              </p>
            </div>

            <div className={Style.contactItem}>
              <FaEnvelope className={Style.reactIcon} />
              <p className={Style.textSecondary}>
                 <strong>Emails:</strong> {contact.emails.map((email, index) => (
                   <React.Fragment key={email}>
                     {contact.enable_contact_form ? (
                       <button onClick={() => setSelectedEmail(email)} className={Style.emailBtn}>{email}</button>
                     ) : (
                       <a href={`mailto:${email}`} className={Style.link}>{email}</a>
                     )}
                     {index < contact.emails.length - 1 && ' | '}
                   </React.Fragment>
                 ))}
              </p>
            </div>

            <div className={Style.socialSection}>
              <div className={Style.contactItem}>
                <FaShareAlt className={Style.reactIcon} />
                <p className={Style.textSecondary}><strong>Redes Sociales:</strong></p>
              </div>
              <div className={Style.containerSocial}>
                 {contact.social.instagram && <a href={contact.social.instagram} target="_blank" rel="noopener noreferrer" className={Style.socialLink}><FaInstagram /></a>}
                 {contact.social.facebook && <a href={contact.social.facebook} target="_blank" rel="noopener noreferrer" className={Style.socialLink}><FaFacebook /></a>}
                 {contact.social.youtube && <a href={contact.social.youtube} target="_blank" rel="noopener noreferrer" className={Style.socialLink}><FaYoutube /></a>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
