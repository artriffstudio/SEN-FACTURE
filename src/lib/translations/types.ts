export type SupportedLanguage = "fr" | "ar" | "en" | "zh";

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
}

export interface TranslationDictionary {
  // Common / Brand
  brandName: string;
  brandTagline: string;
  countryName: string;
  currencySymbol: string;
  currencyCode: string;
  vatRateLabel: string;
  taxIdLabel: string;
  rcLabel: string;

  // Navigation
  nav: {
    dashboard: string;
    invoices: string;
    clients: string;
    inventory: string;
    reports: string;
    receivables: string;
    settings: string;
    support: string;
    features: string;
    pricing: string;
    contact: string;
    login: string;
    register: string;
    logout: string;
    quickInvoice: string;
  };

  // Dashboard
  dashboard: {
    welcome: string;
    subtitle: string;
    kpiRevenue: string;
    kpiPending: string;
    kpiOverdue: string;
    kpiClients: string;
    recentInvoices: string;
    viewAll: string;
    emptyInvoices: string;
    monthlyActivity: string;
    operationalHub: string;
    createFirstInvoice: string;
    addAddress: string;
    downloadContract: string;
    officialDocs: string;
  };

  // Invoices
  invoices: {
    title: string;
    subtitle: string;
    newInvoice: string;
    createModalTitle: string;
    invoiceNumber: string;
    client: string;
    issueDate: string;
    dueDate: string;
    amountHT: string;
    taxRate: string;
    taxAmount: string;
    totalTTC: string;
    status: string;
    actions: string;
    downloadPDF: string;
    shareWhatsApp: string;
    viewDetails: string;
    searchPlaceholder: string;
    filterAll: string;
    filterPaid: string;
    filterPending: string;
    filterOverdue: string;
    filterDraft: string;
    addItem: string;
    removeItem: string;
    description: string;
    quantity: string;
    unitPrice: string;
    subtotal: string;
    notes: string;
    paymentTerms: string;
    bankilyInfo: string;
    seddapInfo: string;
    saveInvoice: string;
    previewA4: string;
    formTab: string;
    previewTab: string;
    certifiedNotice: string;
    itemsTitle: string;
  };

  // Statuses
  status: {
    draft: string;
    sent: string;
    paid: string;
    overdue: string;
    cancelled: string;
  };

  // Clients
  clients: {
    title: string;
    subtitle: string;
    newClient: string;
    clientName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    nif: string;
    uploadLogo: string;
    totalInvoiced: string;
    invoicesCount: string;
    contactWhatsApp: string;
    saveClient: string;
    emptyClients: string;
    createFirstClient: string;
    clientDetails: string;
  };

  // Inventory / Services
  inventory: {
    title: string;
    subtitle: string;
    newItem: string;
    itemCode: string;
    itemName: string;
    category: string;
    unitPrice: string;
    unit: string;
    billThisItem: string;
    allCategories: string;
    searchPlaceholder: string;
  };

  // Reports
  reports: {
    title: string;
    subtitle: string;
    kpiCollected: string;
    kpiReceivables: string;
    kpiRecoveryRate: string;
    kpiVat16: string;
    monthlyEvolution: string;
    clientBreakdown: string;
    generalLedger: string;
    exportCSV: string;
    print: string;
  };

  // Receivables
  receivables: {
    title: string;
    subtitle: string;
    agingBalance: string;
    cashflowForecast: string;
    dso: string;
    recoveryRate: string;
    remindWhatsApp: string;
  };

  // Settings
  settings: {
    title: string;
    subtitle: string;
    companyProfile: string;
    companyName: string;
    tradeName: string;
    nifNumber: string;
    rcNumber: string;
    logoUpload: string;
    uploadHint: string;
    bankDetails: string;
    bankilyNumber: string;
    seddapNumber: string;
    bankRib: string;
    saveChanges: string;
    saveSuccess: string;
  };

  // Support
  support: {
    title: string;
    subtitle: string;
    hotlineTitle: string;
    hotlineNumber: string;
    whatsappTitle: string;
    emailTitle: string;
    ticketFormTitle: string;
    subject: string;
    priority: string;
    message: string;
    sendTicket: string;
    faqTitle: string;
  };

  // Auth
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    welcomeBack: string;
    welcomeBackSubtitle: string;
    joinFacturim: string;
    joinSubtitle: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    firstName: string;
    lastName: string;
    companyNamePlaceholder: string;
    loginButton: string;
    registerButton: string;
    forgotPassword: string;
    noAccount: string;
    haveAccount: string;
    createAccount: string;
    signIn: string;
    instantAccess: string;
  };

  // Landing
  landing: {
    heroBadge: string;
    heroTitlePart1: string;
    heroTitlePart2: string;
    heroSubtitle: string;
    ctaStartFree: string;
    ctaDemo: string;
    statsInvoices: string;
    statsCompanies: string;
    statsUptime: string;
    featuresTitle: string;
    featuresSubtitle: string;
    pricingTitle: string;
    pricingSubtitle: string;
    monthly: string;
    yearly: string;
    perMonth: string;
    popular: string;
    choosePlan: string;
    contactTitle: string;
    contactSubtitle: string;
    rightsReserved: string;
  };
}
