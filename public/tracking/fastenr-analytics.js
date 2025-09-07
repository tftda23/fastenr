/**
 * Fastenr Analytics - Innovative User Tracking
 * Tracks user adoption and engagement with minimal friction using digital fingerprinting
 */

(function(window) {
  'use strict';

  // Prevent multiple initializations
  if (window.FastenrAnalytics) return;

  class FastenrAnalytics {
    constructor(trackingKey, options = {}) {
      this.trackingKey = trackingKey;
      this.apiUrl = options.apiUrl || 'https://your-domain.com/api/tracking';
      this.debug = options.debug || false;
      this.account = options.account || null; // Account context for multi-tenant tracking
      
      this.fingerprint = null;
      this.sessionId = null;
      this.startTime = Date.now();
      this.lastActivity = Date.now();
      this.pageViews = 0;
      this.clickCount = 0;
      this.maxScrollDepth = 0;
      this.formInteractions = 0;
      
      // Behavioral tracking
      this.behavioralData = {
        scrollPattern: [],
        clickPatterns: [],
        typingRhythm: []
      };

      this.init();
    }

    async init() {
      try {
        await this.generateFingerprint();
        await this.startSession();
        this.setupEventListeners();
        this.startHeartbeat();
        
        if (this.debug) console.log('Fastenr Analytics initialized', this.fingerprint);
      } catch (error) {
        console.error('Fastenr Analytics init error:', error);
      }
    }

    async generateFingerprint() {
      // Browser fingerprinting
      const browserFingerprint = {
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        hardwareConcurrency: navigator.hardwareConcurrency,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        canvas: await this.getCanvasFingerprint(),
        webgl: this.getWebGLFingerprint(),
        fonts: await this.getFontFingerprint(),
        plugins: this.getPluginFingerprint()
      };

      // Generate hash from browser fingerprint
      const browserHash = await this.hashObject(browserFingerprint);
      
      // Check for existing session persistence
      const persistentId = this.getOrCreatePersistentId();
      
      // Combine for final fingerprint
      this.fingerprint = await this.hashString(`${browserHash}-${persistentId}`);
      
      return {
        fingerprint: this.fingerprint,
        browserFingerprint,
        persistentId,
        confidence: this.calculateConfidence(browserFingerprint)
      };
    }

    getOrCreatePersistentId() {
      const storageKey = `_fa_${this.trackingKey}`;
      
      // Try localStorage first
      try {
        let id = localStorage.getItem(storageKey);
        if (!id) {
          id = this.generateRandomId();
          localStorage.setItem(storageKey, id);
        }
        return id;
      } catch (e) {
        // Fallback to sessionStorage
        try {
          let id = sessionStorage.getItem(storageKey);
          if (!id) {
            id = this.generateRandomId();
            sessionStorage.setItem(storageKey, id);
          }
          return id;
        } catch (e2) {
          // Ultimate fallback to memory
          return this.generateRandomId();
        }
      }
    }

    async getCanvasFingerprint() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const text = 'FastenrAnalytics fingerprint 🔍';
        
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText(text, 2, 2);
        
        return canvas.toDataURL().slice(-50); // Last 50 chars for uniqueness
      } catch (e) {
        return 'canvas-unavailable';
      }
    }

    getWebGLFingerprint() {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'webgl-unavailable';
        
        const info = {
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          version: gl.getParameter(gl.VERSION),
          shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
        };
        
        return btoa(JSON.stringify(info)).slice(-20);
      } catch (e) {
        return 'webgl-error';
      }
    }

    async getFontFingerprint() {
      const testFonts = ['Arial', 'Times', 'Courier', 'Helvetica', 'Georgia', 'Verdana', 'Comic Sans MS'];
      const availableFonts = [];
      
      for (const font of testFonts) {
        if (await this.checkFont(font)) {
          availableFonts.push(font);
        }
      }
      
      return availableFonts.join(',');
    }

    async checkFont(fontName) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      const baselineFont = 'monospace';
      context.font = `12px ${baselineFont}`;
      const baseline = context.measureText('test').width;
      
      context.font = `12px ${fontName}, ${baselineFont}`;
      const newWidth = context.measureText('test').width;
      
      return newWidth !== baseline;
    }

    getPluginFingerprint() {
      if (!navigator.plugins) return 'no-plugins';
      
      const plugins = Array.from(navigator.plugins).map(plugin => ({
        name: plugin.name,
        description: plugin.description
      }));
      
      return plugins.slice(0, 5).map(p => p.name).join(',');
    }

    calculateConfidence(fingerprint) {
      let confidence = 0.3; // Base confidence
      
      if (fingerprint.canvas !== 'canvas-unavailable') confidence += 0.2;
      if (fingerprint.webgl !== 'webgl-unavailable') confidence += 0.15;
      if (fingerprint.fonts.includes(',')) confidence += 0.1;
      if (fingerprint.plugins !== 'no-plugins') confidence += 0.1;
      if (fingerprint.hardwareConcurrency > 0) confidence += 0.05;
      if (localStorage) confidence += 0.1;
      
      return Math.min(confidence, 1.0);
    }

    async hashObject(obj) {
      return this.hashString(JSON.stringify(obj));
    }

    async hashString(str) {
      if (crypto && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
      
      // Fallback hash for older browsers
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16);
    }

    generateRandomId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    async startSession() {
      this.sessionId = this.generateRandomId();
      
      const sessionData = {
        trackingKey: this.trackingKey,
        fingerprint: this.fingerprint,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        landingPage: window.location.href,
        timestamp: Date.now()
      };

      await this.sendEvent('session_start', sessionData);
    }

    setupEventListeners() {
      // Page view tracking
      this.trackPageView();
      
      // Scroll depth tracking
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.trackScrollDepth();
            ticking = false;
          });
          ticking = true;
        }
      });

      // Click tracking with behavioral analysis
      document.addEventListener('click', (e) => {
        this.trackClick(e);
        this.analyzeBehavior('click', {
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now(),
          target: this.getElementSelector(e.target)
        });
      });

      // Form interaction tracking
      document.addEventListener('focus', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
          this.trackFormInteraction(e.target);
        }
      });

      // Typing rhythm analysis (privacy-conscious)
      let lastKeyTime = 0;
      document.addEventListener('keypress', () => {
        const now = Date.now();
        if (lastKeyTime > 0) {
          const interval = now - lastKeyTime;
          this.behavioralData.typingRhythm.push(interval);
          
          // Keep only last 20 intervals to avoid memory issues
          if (this.behavioralData.typingRhythm.length > 20) {
            this.behavioralData.typingRhythm.shift();
          }
        }
        lastKeyTime = now;
      });

      // Page unload tracking
      window.addEventListener('beforeunload', () => {
        this.endSession();
      });

      // Visibility change tracking
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseSession();
        } else {
          this.resumeSession();
        }
      });
    }

    trackPageView() {
      this.pageViews++;
      this.sendEvent('page_view', {
        url: window.location.href,
        title: document.title,
        timestamp: Date.now()
      });
    }

    trackScrollDepth() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const scrollDepth = (scrollTop + windowHeight) / documentHeight;
      
      if (scrollDepth > this.maxScrollDepth) {
        this.maxScrollDepth = scrollDepth;
        
        // Track behavioral scroll pattern
        this.behavioralData.scrollPattern.push({
          depth: scrollDepth,
          timestamp: Date.now(),
          speed: scrollDepth - (this.behavioralData.scrollPattern[this.behavioralData.scrollPattern.length - 1]?.depth || 0)
        });
        
        // Keep only last 50 scroll events
        if (this.behavioralData.scrollPattern.length > 50) {
          this.behavioralData.scrollPattern.shift();
        }
      }
    }

    trackClick(event) {
      this.clickCount++;
      this.lastActivity = Date.now();
      
      this.sendEvent('click', {
        element: this.getElementSelector(event.target),
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now()
      });
    }

    trackFormInteraction(element) {
      this.formInteractions++;
      this.lastActivity = Date.now();
      
      this.sendEvent('form_interaction', {
        element: this.getElementSelector(element),
        type: element.type || element.tagName.toLowerCase(),
        timestamp: Date.now()
      });
    }

    getElementSelector(element) {
      if (element.id) return `#${element.id}`;
      if (element.className) return `.${element.className.split(' ')[0]}`;
      return element.tagName.toLowerCase();
    }

    analyzeBehavior(type, data) {
      // Add behavioral data for user identification
      if (type === 'click') {
        this.behavioralData.clickPatterns.push(data);
        if (this.behavioralData.clickPatterns.length > 100) {
          this.behavioralData.clickPatterns.shift();
        }
      }
    }

    async sendEvent(eventType, eventData) {
      try {
        const payload = {
          trackingKey: this.trackingKey,
          fingerprint: this.fingerprint,
          sessionId: this.sessionId,
          eventType,
          eventData,
          timestamp: Date.now()
        };
        
        // Add account context if available
        if (this.account) {
          payload.account = this.account;
        }

        // Use sendBeacon for better reliability, fallback to fetch
        if (navigator.sendBeacon && eventType === 'session_end') {
          navigator.sendBeacon(`${this.apiUrl}/events`, JSON.stringify(payload));
        } else {
          await fetch(`${this.apiUrl}/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            keepalive: true
          });
        }

        if (this.debug) console.log('Event sent:', eventType, eventData);
      } catch (error) {
        if (this.debug) console.error('Failed to send event:', error);
      }
    }

    startHeartbeat() {
      this.heartbeatInterval = setInterval(() => {
        this.sendHeartbeat();
      }, 30000); // Every 30 seconds
    }

    sendHeartbeat() {
      if (Date.now() - this.lastActivity < 60000) { // Active in last minute
        this.sendEvent('heartbeat', {
          pageViews: this.pageViews,
          clickCount: this.clickCount,
          maxScrollDepth: this.maxScrollDepth,
          formInteractions: this.formInteractions,
          sessionDuration: Date.now() - this.startTime,
          behavioralSignature: this.getBehavioralSignature()
        });
      }
    }

    getBehavioralSignature() {
      // Create privacy-conscious behavioral signature
      const signature = {};
      
      if (this.behavioralData.clickPatterns.length > 0) {
        const avgClickInterval = this.behavioralData.clickPatterns
          .reduce((acc, curr, idx, arr) => {
            if (idx === 0) return 0;
            return acc + (curr.timestamp - arr[idx - 1].timestamp);
          }, 0) / (this.behavioralData.clickPatterns.length - 1);
        
        signature.avgClickInterval = Math.round(avgClickInterval);
      }
      
      if (this.behavioralData.typingRhythm.length > 5) {
        const avgTypingInterval = this.behavioralData.typingRhythm
          .reduce((a, b) => a + b, 0) / this.behavioralData.typingRhythm.length;
        
        signature.avgTypingInterval = Math.round(avgTypingInterval);
      }
      
      if (this.behavioralData.scrollPattern.length > 0) {
        const avgScrollSpeed = this.behavioralData.scrollPattern
          .map(s => s.speed)
          .reduce((a, b) => a + b, 0) / this.behavioralData.scrollPattern.length;
        
        signature.avgScrollSpeed = Math.round(avgScrollSpeed * 1000) / 1000;
      }
      
      return signature;
    }

    pauseSession() {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
    }

    resumeSession() {
      this.startHeartbeat();
      this.lastActivity = Date.now();
    }

    endSession() {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
      
      this.sendEvent('session_end', {
        sessionDuration: Date.now() - this.startTime,
        pageViews: this.pageViews,
        clickCount: this.clickCount,
        maxScrollDepth: this.maxScrollDepth,
        formInteractions: this.formInteractions,
        exitPage: window.location.href,
        behavioralSignature: this.getBehavioralSignature()
      });
    }

    // Public API methods
    identify(userId, properties = {}) {
      this.sendEvent('identify', {
        userId,
        properties,
        timestamp: Date.now()
      });
    }

    track(eventName, properties = {}) {
      this.sendEvent('custom', {
        eventName,
        properties,
        timestamp: Date.now()
      });
    }

    page(pageName, properties = {}) {
      this.trackPageView();
      this.sendEvent('page', {
        pageName,
        properties,
        url: window.location.href,
        timestamp: Date.now()
      });
    }
  }

  // Global initialization function
  window.fastenr = function(trackingKey, options) {
    if (!window.FastenrAnalytics._instance) {
      window.FastenrAnalytics._instance = new FastenrAnalytics(trackingKey, options);
    }
    return window.FastenrAnalytics._instance;
  };

  // Queue for calls made before initialization
  window.fastenr.q = window.fastenr.q || [];
  
  // Process any queued calls
  if (window.fastenr.q.length > 0) {
    window.fastenr.q.forEach(call => {
      const [method, ...args] = call;
      if (window.FastenrAnalytics._instance && window.FastenrAnalytics._instance[method]) {
        window.FastenrAnalytics._instance[method](...args);
      }
    });
    window.fastenr.q = [];
  }

  window.FastenrAnalytics = FastenrAnalytics;

})(window);