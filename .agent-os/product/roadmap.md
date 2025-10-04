# Product Roadmap

## Phase 1: Core MVP

**Goal:** Launch functional AI tutor bot with basic prompt management  
**Success Criteria:** 
- Bot responds to messages with AI-generated answers
- Conversation history persists across sessions
- Admin can create and switch prompts via web dashboard
- Deployed to Railway with persistent storage

### Features

- [x] Project initialization and setup `XS`
- [ ] File storage service (read/write JSON files) `S`
- [ ] Gemini AI service (chat session management) `S`
- [ ] Telegram bot handlers (message processing) `M`
- [ ] Basic web server (Fastify setup) `S`
- [ ] Prompt management API (CRUD endpoints) `M`
- [ ] Dialog history API (read user conversations) `S`
- [ ] Simple web UI (HTML/CSS/JS for prompts) `M`
- [ ] Dialog history web viewer UI `M`
- [ ] User activity dashboard `M`
- [ ] Responsive web design (mobile-friendly) `M`
- [ ] Environment setup and documentation `XS`
- [ ] Railway deployment configuration `S`

### Dependencies

- Telegram Bot Token from @BotFather
- Gemini API Key from GCP Console
- Railway account with persistent volume setup

**Estimated Effort:** 3-4 weeks

---

## Future Considerations (Out of Scope)

### Multi-Language Support
- Interface translation
- Multi-language prompts
- Language detection

### Advanced AI Features
- Voice message handling
- Image upload for technique questions
- Multi-turn conversation flows with forms

### Integration Features
- CRM integration for client data
- Booking system integration
- Product inventory integration

### Enterprise Features
- Multi-salon support
- White-label branding
- Custom domain support
- Advanced reporting and exports
- API for third-party integrations

---

## Release Strategy

### v1.0 - MVP Launch
- Target: Phase 1 complete
- Audience: Single salon (beta testing)
- Timeline: Week 3-4

---

## Success Metrics

### Technical Metrics
- Uptime > 99%
- Response time < 5 seconds
- Error rate < 1%
- Zero data loss events

### Business Metrics
- Daily active users: 5+ (per salon)
- Average session duration: 5-10 minutes
- Messages per user per day: 10-20
- Prompt switch frequency: 1-2 times per week

### User Satisfaction
- Employee satisfaction score > 4/5
- Manager satisfaction score > 4/5
- Question resolution rate > 90%
- Repeat usage rate > 80%

---

## Risk Mitigation

### Technical Risks
- **Gemini API rate limits:** Use paid tier, implement retry logic
- **File storage corruption:** Implement atomic writes, regular backups
- **Railway downtime:** Monitor uptime, have deployment backup plan
- **Scalability limits:** Design with database migration path

### Business Risks
- **Low adoption:** Onboard with training, demonstrate value early
- **Poor AI quality:** Iterate on prompts, gather feedback, tune settings
- **Cost overruns:** Monitor GCP billing, set alerts, optimize context usage
- **Data privacy concerns:** Document data handling, add authentication early
