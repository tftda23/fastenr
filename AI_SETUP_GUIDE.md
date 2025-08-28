# AI Insights Setup Guide

This guide will help you configure the AI insights feature in Fastenr to provide intelligent analysis and recommendations.

## 🚀 **Quick Setup**

### **Step 1: Get an OpenAI API Key**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-`)

### **Step 2: Configure Environment Variables**
Add these variables to your `.env.local` file:

```bash
# Required: OpenAI API key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Model configuration (defaults shown)
OPENAI_MODEL=gpt-4                    # or gpt-4-turbo, gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000                # Response length limit
OPENAI_TEMPERATURE=0.3                # Creativity (0.0-1.0)

# Optional: Fallback behavior
AI_FALLBACK_TO_MOCK=true              # Use mock data if AI fails
```

### **Step 3: Restart Your Application**
```bash
npm run dev
```

### **Step 4: Test AI Insights**
1. Navigate to any page (Dashboard, Accounts, Contacts, Account Details)
2. Click the purple "AI Insights" button
3. Click "Analyze Now" to generate insights

## 🔧 **Configuration Options**

### **Model Selection**
- **`gpt-4`** (Recommended): Most accurate, higher cost
- **`gpt-4-turbo`**: Faster, good balance of speed and accuracy  
- **`gpt-3.5-turbo`**: Fastest, lower cost, less detailed insights

### **Token Limits**
- **`1000`**: Brief insights
- **`2000`** (Default): Detailed insights
- **`4000`**: Comprehensive analysis (higher cost)

### **Temperature Settings**
- **`0.1`**: Very focused, consistent responses
- **`0.3`** (Default): Good balance
- **`0.7`**: More creative, varied responses

## 🛡️ **Security & Privacy**

### **Data Protection**
✅ **What IS sent to AI:**
- Account metrics (health scores, ARR, status)
- Industry and company size information
- Engagement counts and types
- Goal progress and statuses
- Contact role levels and departments

❌ **What is NOT sent to AI:**
- Personal names or emails
- Phone numbers or addresses
- Specific contact details
- Detailed engagement notes (configurable)
- Any personally identifiable information

### **API Key Security**
- Store API keys in environment variables only
- Never commit keys to version control
- Use different keys for development/production
- Rotate keys regularly
- Monitor usage in OpenAI dashboard

## 🔍 **Testing & Troubleshooting**

### **Health Check**
Test your configuration:
```bash
curl http://localhost:3000/api/ai/health
```

### **Common Issues**

**"AI service not configured"**
- Check that `OPENAI_API_KEY` is set
- Verify the key starts with `sk-`
- Restart your application after adding the key

**"Rate limit exceeded"**
- You've hit OpenAI's usage limits
- Wait a few minutes and try again
- Consider upgrading your OpenAI plan

**"Invalid API key"**
- Check the key is copied correctly
- Verify the key hasn't expired
- Generate a new key in OpenAI dashboard

**Mock insights appearing**
- Check that `OPENAI_API_KEY` is properly set
- Set `AI_FALLBACK_TO_MOCK=false` to force real AI
- Check console logs for error details

### **Development vs Production**

**Development (.env.local):**
```bash
OPENAI_API_KEY=sk-dev-key-here
AI_FALLBACK_TO_MOCK=true              # Allows fallback during development
OPENAI_MODEL=gpt-3.5-turbo           # Cheaper for testing
```

**Production:**
```bash
OPENAI_API_KEY=sk-prod-key-here
AI_FALLBACK_TO_MOCK=false             # Require real AI in production
OPENAI_MODEL=gpt-4                    # Best quality for users
```

## 💰 **Cost Management**

### **Estimated Costs (USD)**
- **gpt-3.5-turbo**: ~$0.01 per insight
- **gpt-4**: ~$0.10 per insight  
- **gpt-4-turbo**: ~$0.05 per insight

### **Cost Optimization Tips**
1. Use `gpt-3.5-turbo` for development
2. Set appropriate `MAX_TOKENS` limits
3. Monitor usage in OpenAI dashboard
4. Set up billing alerts
5. Consider caching insights for repeat requests

## 📊 **What You Get**

### **Dashboard Insights**
- At-risk account identification
- Engagement gap analysis
- Growth opportunity detection
- Portfolio health trends

### **Account Analysis**
- Individual account health assessment
- Relationship coverage gaps
- Suggested next actions
- Risk mitigation strategies

### **Contact Intelligence**
- Decision maker coverage analysis
- Relationship mapping suggestions
- Contact data gap identification
- Stakeholder engagement strategies

## 🎯 **Next Steps**

1. **Set up your API key** following Step 1-3 above
2. **Test on different pages** to see various insights
3. **Customize prompts** in `/lib/ai/prompts.ts` for your use case
4. **Monitor costs** and adjust model settings as needed
5. **Train your team** on interpreting and acting on insights

## 🆘 **Support**

If you need help:
1. Check the console logs in your browser's developer tools
2. Review the server logs for detailed error messages
3. Test the health check endpoint: `/api/ai/health`
4. Verify your OpenAI account has sufficient credits
5. Check the [OpenAI Status Page](https://status.openai.com/) for service issues

---

**Ready to get intelligent insights about your customer success data? Follow the Quick Setup steps above! 🧠✨**