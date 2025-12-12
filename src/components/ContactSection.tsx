import { MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactSection = () => {
  return (
    <section className="bg-dark-section py-20" id="contact">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-display text-primary-foreground text-center mb-4">
          Contact Us
        </h2>
        <div className="w-24 h-1 bg-saffron mx-auto mb-12" />

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-display text-saffron mb-6">
              SAKETHAM HINDU LITIGANTS TRUST
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-saffron mt-1 flex-shrink-0" />
                <p className="text-primary-foreground/80">
                  No 63/3171 Bharatham, Opposite NSS Karayogam, Palliparambu Lane, 
                  Ponoth Road, Kaloor P.O, PIN 682017
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-saffron flex-shrink-0" />
                <a
                  href="mailto:contact@savedeities.org"
                  className="text-primary-foreground/80 hover:text-saffron transition-colors"
                >
                  contact@savedeities.org
                </a>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-saffron flex-shrink-0" />
                <a
                  href="tel:+918138018300"
                  className="text-primary-foreground/80 hover:text-saffron transition-colors"
                >
                  +91 8138018300
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-dark-card border border-border rounded-lg text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-saffron"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 bg-dark-card border border-border rounded-lg text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-saffron"
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                className="w-full px-4 py-3 bg-dark-card border border-border rounded-lg text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-saffron"
              />
              <textarea
                placeholder="Your Message"
                rows={5}
                className="w-full px-4 py-3 bg-dark-card border border-border rounded-lg text-primary-foreground placeholder:text-muted-foreground focus:outline-none focus:border-saffron resize-none"
              />
              <Button variant="saffron" size="lg" className="w-full md:w-auto">
                Write to us
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
