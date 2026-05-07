import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Zap, Globe, Users, Trophy, Star, ArrowRight, 
  Check, Menu, X, Mail, Github, Twitter, Linkedin, 
  Play, BarChart2, Layers, Cpu
} from 'lucide-react';

const LandingPage = ({ setView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    revealRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="bg-bg-deep text-white selection:bg-primary selection:text-white">
      {/* Premium Navbar */}
      <nav className="fixed top-0 w-full z-[100] glass-nav py-5 px-6">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield size={24} />
            </div>
            <span className="font-display text-xl tracking-tight">AdminPro</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {['Features', 'Product', 'Pricing', 'Testimonials'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">
                {item}
              </a>
            ))}
            <div className="w-px h-6 bg-border mx-2" />
            <button onClick={() => setView('login')} className="text-sm font-bold text-text-secondary hover:text-white transition-colors">
              Log In
            </button>
            <button onClick={() => setView('register')} className="btn-premium px-6 py-3 text-sm">
              Get Started
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden p-2 text-text-secondary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-bg-surface border-b border-border p-8 lg:hidden"
            >
              <div className="flex flex-col gap-6">
                {['Features', 'Product', 'Pricing', 'Testimonials'].map(item => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="text-lg font-bold text-text-secondary" onClick={() => setIsMenuOpen(false)}>
                    {item}
                  </a>
                ))}
                <div className="h-px bg-border w-full" />
                <button onClick={() => setView('login')} className="text-lg font-bold text-text-secondary text-left">Log In</button>
                <button onClick={() => setView('register')} className="btn-premium w-full">Join Now</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 overflow-hidden">
        {/* Animated Orbs */}
        <div className="bg-glow-orb w-[600px] h-[600px] bg-primary/20 top-[-200px] right-[-100px]" />
        <div className="bg-glow-orb w-[400px] h-[400px] bg-accent/20 bottom-0 left-[-100px]" style={{ animationDelay: '-5s' }} />

        <div className="container relative z-10 text-center">
          <div className="reveal flex justify-center mb-6" ref={addToRefs}>
            <div className="pulsing-badge">Available Now — Enterprise V2.4</div>
          </div>
          <h1 className="reveal font-display text-2xl mb-8 leading-[1.05]" ref={addToRefs}>
            The Operating System for <br />
            <span className="text-gradient">Professional Assessments</span>
          </h1>
          <p className="reveal text-font-base text-text-secondary max-w-2xl mx-auto mb-12 font-medium" ref={addToRefs}>
            Deploy authenticated, state-of-the-art examinations at global scale. Automated proctoring, real-time analytics, and enterprise-grade security unified in one platform.
          </p>
          <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-6" ref={addToRefs}>
            <button onClick={() => setView('register')} className="btn-premium px-10 py-5 text-lg w-full sm:w-auto">
              Start Free Trial <ArrowRight className="ml-2" size={20} />
            </button>
            <button className="px-10 py-5 bg-white/5 border border-border rounded-2xl font-bold hover:bg-white/10 transition-all w-full sm:w-auto">
              Book a Demo
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="reveal mt-20 md:mt-32 pt-12 md:pt-20 border-t border-border" ref={addToRefs}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Active Candidates', value: '2.4M+' },
                { label: 'Exams Delivered', value: '18M+' },
                { label: 'Uptime SLA', value: '99.99%' },
                { label: 'Global Partners', value: '500+' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-font-lg font-display mb-1">{stat.value}</div>
                  <div className="text-xs font-bold text-text-muted uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 md:py-32 bg-bg-surface">
        <div className="container">
          <div className="reveal mb-20 text-center" ref={addToRefs}>
            <h2 className="font-display text-xl mb-4">Engineered for Performance</h2>
            <p className="text-text-secondary font-medium">Tools built to handle high-stakes assessments without compromise.</p>
          </div>

          <div className="grid-auto-fit">
            {[
              { title: 'Global Infrastructure', icon: Globe, desc: 'Ultra-low latency delivery via 200+ edge nodes worldwide.', color: 'bg-blue-500' },
              { title: 'AI-Driven Proctoring', icon: Zap, desc: 'Real-time behavior analysis and anomaly detection for secure testing.', color: 'bg-indigo-500' },
              { title: 'Advanced Analytics', icon: BarChart2, desc: 'Granular performance metrics and predictive scoring models.', color: 'bg-purple-500' },
              { title: 'Seamless Integration', icon: Layers, desc: 'Connect with your existing LMS via robust REST API and webhooks.', color: 'bg-pink-500' },
              { title: 'Automated Grading', icon: Cpu, desc: 'ML-powered evaluation for MCQs, Fill-ins, and complex logic.', color: 'bg-emerald-500' },
              { title: 'Ironclad Security', icon: Shield, desc: 'End-to-end encryption and multi-factor biometric authentication.', color: 'bg-orange-500' },
            ].map((feat, i) => (
              <div key={i} className="reveal group bg-bg-card p-6 md:p-10 rounded-xl border border-border hover:border-primary transition-all duration-500" ref={addToRefs}>
                <div className={`w-14 h-14 ${feat.color} bg-opacity-10 rounded-2xl flex items-center justify-center text-${feat.color.split('-')[1]}-500 mb-8 group-hover:scale-110 transition-transform`}>
                  <feat.icon size={28} />
                </div>
                <h3 className="text-font-base font-display mb-4">{feat.title}</h3>
                <p className="text-text-secondary text-sm font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section id="product" className="py-20 md:py-32 relative overflow-hidden">
        <div className="bg-glow-orb w-[800px] h-[800px] bg-primary/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        <div className="container relative z-10">
          <div className="reveal mb-20 text-center" ref={addToRefs}>
            <h2 className="font-display text-xl mb-4">Command & Control</h2>
            <p className="text-text-secondary font-medium">An intuitive management suite for content creators and administrators.</p>
          </div>

          {/* Mini Live Data Window Mockup */}
          <div className="reveal bg-bg-card border border-border rounded-xl overflow-hidden shadow-2xl" ref={addToRefs}>
            <div className="bg-bg-surface p-4 border-b border-border flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                <div className="w-3 h-3 rounded-full bg-orange-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-text-muted">system-terminal-v2.0</div>
            </div>
            <div className="p-8 lg:p-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                     <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                           <span className="text-xs font-bold text-text-secondary uppercase">Live Completion Rate</span>
                           <span className="text-emerald-500 text-xs font-bold">+12.4%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: '84%' }}
                              className="h-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                           />
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="flex-1 p-6 bg-white/5 rounded-2xl border border-white/5">
                           <div className="text-xs font-bold text-text-muted mb-2">Active Exams</div>
                           <div className="text-2xl font-display">1,402</div>
                        </div>
                        <div className="flex-1 p-6 bg-white/5 rounded-2xl border border-white/5">
                           <div className="text-xs font-bold text-text-muted mb-2">SLA Health</div>
                           <div className="text-2xl font-display text-emerald-500">100%</div>
                        </div>
                     </div>
                  </div>
                  <div className="hidden lg:block relative">
                     <div className="p-8 bg-primary/5 border border-primary/20 rounded-[32px] relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                           <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                              <Cpu size={24} />
                           </div>
                           <div>
                              <div className="text-sm font-bold">Auto-Grading Core</div>
                              <div className="text-xs text-text-muted">Processing Batch #482...</div>
                           </div>
                        </div>
                        <div className="space-y-3">
                           {[1, 2, 3].map(i => (
                              <div key={i} className="h-3 bg-white/10 rounded-full w-full" style={{ width: `${Math.random() * 60 + 40}%` }} />
                           ))}
                        </div>
                     </div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 blur-[60px] -z-10" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-bg-surface">
        <div className="container">
          <div className="reveal mb-20 text-center" ref={addToRefs}>
            <h2 className="font-display text-xl mb-4">Scale with Your Ambition</h2>
            <p className="text-text-secondary font-medium">Transparent pricing designed for institutions of every size.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Starter', price: '$49', desc: 'For independent instructors.', features: ['100 Candidates/mo', 'Basic Analytics', 'Standard Support'] },
              { name: 'Professional', price: '$199', desc: 'For growing departments.', features: ['1,000 Candidates/mo', 'Advanced Proctoring', 'API Access', 'Priority Support'], featured: true },
              { name: 'Enterprise', price: 'Custom', desc: 'For global organizations.', features: ['Unlimited Candidates', 'White-label Solution', 'Custom Integrations', 'Dedicated Manager'] },
            ].map((plan, i) => (
              <div key={i} className={`reveal p-6 md:p-10 rounded-[32px] md:rounded-[40px] border ${plan.featured ? 'border-primary bg-primary/5 scale-100 md:scale-105 shadow-2xl shadow-primary/10' : 'border-border bg-bg-card'} flex flex-col`} ref={addToRefs}>
                {plan.featured && <div className="text-center mb-6"><span className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Most Popular</span></div>}
                <div className="text-font-lg font-display mb-2">{plan.name}</div>
                <div className="text-text-secondary text-sm mb-8">{plan.desc}</div>
                <div className="mb-10">
                  <span className="text-font-xl font-display">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-text-muted font-bold ml-2">/ month</span>}
                </div>
                <div className="space-y-4 mb-12 flex-1">
                  {plan.features.map((feat, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Check size={14} /></div>
                      {feat}
                    </div>
                  ))}
                </div>
                <button className={`w-full py-5 rounded-2xl font-bold transition-all ${plan.featured ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 border border-border text-white hover:bg-white/10'}`}>
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-32">
        <div className="container">
          <div className="reveal mb-20 text-center" ref={addToRefs}>
            <h2 className="font-display text-xl mb-4">Trusted by Industry Leaders</h2>
            <div className="flex items-center justify-center gap-1 text-primary mb-4">
               {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-text-secondary font-medium">Ranked #1 for reliability and candidate experience.</p>
          </div>

          <div className="grid-auto-fit">
            {[
              { name: 'Dr. Sarah Chen', role: 'Dean of Technology', text: 'The automated proctoring changed our department. We now handle 5,000+ remote exams monthly with absolute integrity.', initials: 'SC' },
              { name: 'Marcus Thorne', role: 'CTO at EduScale', text: 'AdminPro provided the API stability we needed. Their integration layer is by far the most developer-friendly in the space.', initials: 'MT' },
              { name: 'Elena Rodriguez', role: 'Certification Lead', text: 'Candidate feedback has been overwhelmingly positive. The interface is clean, modern, and reduces testing anxiety.', initials: 'ER' },
            ].map((t, i) => (
              <div key={i} className="reveal bg-bg-surface p-6 md:p-10 rounded-[24px] md:rounded-[32px] border border-border" ref={addToRefs}>
                <p className="text-lg italic text-text-secondary mb-10 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center font-display font-bold border border-white/10">{t.initials}</div>
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-xs text-text-muted font-medium">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="bg-glow-orb w-[1000px] h-[1000px] bg-primary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="container relative z-10">
          <div className="reveal bg-bg-card p-8 md:p-12 lg:p-24 rounded-[32px] md:rounded-[48px] border border-border text-center overflow-hidden relative" ref={addToRefs}>
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -z-10" />
             <div className="max-w-2xl mx-auto">
                <h2 className="font-display text-2xl mb-6">Ready to Modernize Your Assessment Ecosystem?</h2>
                <p className="text-text-secondary font-medium mb-12">Join 5,000+ institutions delivering the future of professional certification today.</p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                  <div className="relative w-full sm:w-80">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                     <input 
                        type="email" 
                        placeholder="Enter your email" 
                        className="w-full pl-12 pr-4 py-5 bg-bg-deep border border-border rounded-2xl outline-none focus:border-primary transition-all font-medium"
                     />
                  </div>
                  <button onClick={() => setView('register')} className="btn-premium w-full sm:w-auto px-10 py-5">
                    Start Your Trial
                  </button>
                </div>
                <p className="mt-8 text-xs text-text-muted font-bold uppercase tracking-widest">No credit card required • 14-day free trial</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <span className="font-display text-lg tracking-tight">AdminPro</span>
              </div>
              <p className="text-text-secondary text-sm font-medium mb-8">
                Defining the standard for professional assessment infrastructure since 2024.
              </p>
              <div className="flex gap-4">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="p-2 bg-white/5 rounded-lg text-text-muted hover:text-primary transition-colors">
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display text-base mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-medium text-text-secondary">
                {['Platform', 'Proctoring', 'Analytics', 'Security'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display text-base mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-text-secondary">
                {['About', 'Careers', 'Blog', 'Contact'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display text-base mb-6">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-text-secondary">
                {['Privacy', 'Terms', 'Security', 'SLA'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-border text-xs font-bold text-text-muted uppercase tracking-[0.2em]">
            <p>© 2026 AdminPro Infrastructure Inc.</p>
            <div className="flex gap-8 mt-6 md:mt-0">
               <a href="#" className="hover:text-white">Status</a>
               <a href="#" className="hover:text-white">API Docs</a>
               <a href="#" className="hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
