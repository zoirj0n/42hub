
import { Link } from "react-router-dom";
import { Calendar, Github, Mail, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t py-12 md:py-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
                <Calendar className="h-5 w-5 absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">42 Community</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Connect with the 42 community and discover amazing events, workshops, 
              hackathons, and conferences happening around you.
            </p>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </a>
                <a href="mailto:contact@42community.com" className="text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">Email</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="mb-3 text-sm font-medium border-b pb-2">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    All Events
                  </Link>
                </li>
                <li>
                  <Link to="/calendar" className="text-muted-foreground hover:text-foreground transition-colors">
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link to="/subscriptions" className="text-muted-foreground hover:text-foreground transition-colors">
                    My Subscriptions
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    My Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="mb-3 text-sm font-medium border-b pb-2">Categories</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/?category=Workshop" className="text-muted-foreground hover:text-foreground transition-colors">
                    Workshops
                  </Link>
                </li>
                <li>
                  <Link to="/?category=Conference" className="text-muted-foreground hover:text-foreground transition-colors">
                    Conferences
                  </Link>
                </li>
                <li>
                  <Link to="/?category=Hackathon" className="text-muted-foreground hover:text-foreground transition-colors">
                    Hackathons
                  </Link>
                </li>
                <li>
                  <Link to="/?category=Meetup" className="text-muted-foreground hover:text-foreground transition-colors">
                    Meetups
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="mb-3 text-sm font-medium border-b pb-2">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-center md:text-left">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} 42 Community. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/contact" className="hover:underline">Contact Us</Link>
            <span>Made with ❤️ by Zoirjon Sobirov</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
