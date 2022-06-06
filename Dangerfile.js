const { customRules } = require("@pagopa/danger-plugin");

const recordScope = {
  projectToScope: {
    2449547: "Bonus Vacanze",
    2463683: "My Portal",
    2477137: "Bonus Pagamenti Digitali",
    IAC: "Bonus Pagamenti Digitali",
    IOACGN: "Carta Giovani Nazionale",
    IASV: "Sicilia Vola",
    IAGP: "EU Covid Certificate",
    IARS: "Redesign Servizi",
    ASZ: "Zendesk",
    IAMVL: "Piattaforma Notifiche",
    IAFIMS: "Federated Identity Management System",
    AP: "Carta della cultura",
    SFEQS: "Firma con IO",
  },
  tagToScope: {
    android: "Android",
    ios: "iOS",
    bonus_vacanze: "Bonus Vacanze",
    messages: "Messages",
    payments: "Payments",
    services: "Services",
    profile: "Profile",
    privacy: "Privacy",
    security: "Security",
    accessibility: "Accessibility",
    bpd: "Bonus Pagamenti Digitali",
    cgn: "Carta Giovani Nazionale",
    fims: "Federated Identity Management System",
    myportal: "My Portal",
    development: "Development",
    backend: "Backend",
  },
};

customRules(recordScope);
