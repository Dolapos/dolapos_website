import React, { useState } from 'react';


export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });


  const [submitStatus, setSubmitStatus] = useState('');


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
   
    try {
      const response = await fetch('https://formspree.io/f/manawqbl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });


      if (response.ok) {
        setSubmitStatus('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('Error sending message. Please try again.');
    }
  };


  return (
    <section className="contact-page">
      <div className="contact-page-container">
        <h2>CONTACT</h2>
        <a href="mailto:dolydolli1279@gmail.com" className="contact-email-text">
            dolydolli1279@gmail.com
        </a>


        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">NAME</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="email">EMAIL (required)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="message">MESSAGE</label>
            <textarea
              id="message"
              name="message"
              rows="6"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>


          <button type="submit" className="submit-button">
            SUBMIT
          </button>


          {submitStatus && (
            <p className="submit-status">{submitStatus}</p>
          )}
        </form>
      </div>
    </section>
  );
}
