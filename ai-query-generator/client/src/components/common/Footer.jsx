import { FiLinkedin, FiInstagram, FiMail, FiPhone } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="glass-dark border-t border-white/10 mt-auto">
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand + Developer Info */}
        <div>
          <h3 className="font-bold text-lg gradient-text mb-1">QueryAI</h3>
          <p className="text-purple-400 font-medium text-sm mb-2">Built by Abhishek Bisht</p>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Convert plain English to optimized database queries using Gemini AI. Enterprise-grade security and performance.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/abhishek-bisht-149784351?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank" rel="noreferrer"
              className="w-9 h-9 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/50 transition-all"
              title="LinkedIn"
            >
              <FiLinkedin size={18} />
            </a>
            <a
              href="https://www.instagram.com/akbisht.7?igsh=Y2M3MTJua2hxejI2"
              target="_blank" rel="noreferrer"
              className="w-9 h-9 glass rounded-lg flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-500/50 transition-all"
              title="Instagram"
            >
              <FiInstagram size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            {[
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/query', label: 'Query Generator' },
              { to: '/history', label: 'History' },
              { to: '/favorites', label: 'Favorites' },
              { to: '/chat', label: 'AI Chat' },
            ].map(l => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-purple-400 transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white mb-3">Contact</h4>
          <div className="space-y-3 text-sm">
            <a href="mailto:akbishtcr7@gmail.com"
              className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors">
              <FiMail size={15} />
              <span>akbishtcr7@gmail.com</span>
            </a>
            <a href="tel:+918077639859"
              className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors">
              <FiPhone size={15} />
              <span>+91 80776 39859</span>
            </a>
            <a href="https://www.instagram.com/akbisht.7?igsh=Y2M3MTJua2hxejI2"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors">
              <FiInstagram size={15} />
              <span>@akbisht.7</span>
            </a>
            <a href="https://www.linkedin.com/in/abhishek-bisht-149784351?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
              <FiLinkedin size={15} />
              <span>Abhishek Bisht</span>
            </a>
          </div>
        </div>

      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600">
        <p>© {new Date().getFullYear()} QueryAI. All rights reserved.</p>
        <p>Made with ❤️ by <span className="text-purple-400">Abhishek Bisht</span> using Gemini AI</p>
      </div>
    </div>
  </footer>
);

export default Footer;
