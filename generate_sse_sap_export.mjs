import fs from "node:fs/promises";
import crypto from "node:crypto";

const ROW_COUNT = 1000;
const OUTPUT = "outputs/sse_sap_historical_customer_export.csv";

const headers = [
  "UserGuid",
  "EmailAddress",
  "CustomerNumber",
  "AgreementNumber",
  "LinkedAdminAgreement",
  "AdminInvoiced",
  "AgreementSignupDate",
  "CustomerSignupDate",
  "CustomerType",
  "Segment",
  "Commodity",
  "ProductName",
  "TariffCode",
  "DistributionRegion",
  "MeterPointEIC",
  "MeterSerialNumber",
  "SmartMeterInstalled",
  "MeterReadingFrequency",
  "LastMeterReadingDate",
  "LastMeterReadingValue",
  "AnnualConsumptionKWh",
  "AnnualGasConsumptionM3",
  "CurrentAccountingYearEndDate",
  "InvoiceDeliveryMethod",
  "InvoiceFrequency",
  "LastInvoiceDate",
  "LastInvoiceAmountEUR",
  "OutstandingBalanceEUR",
  "PaymentMethod",
  "DirectDebitActive",
  "LatePaymentsLast12M",
  "PaymentPlanActive",
  "MonthlyDepositEUR",
  "EZonaRegistered",
  "EZonaLastLoginDate",
  "AppUsage",
  "MobileAppPlatform",
  "NewsletterConsent",
  "MarketingConsent",
  "OutageNotificationConsent",
  "PlannedOutageCountLast12M",
  "UnplannedOutageCountLast12M",
  "OpenServiceRequests",
  "LastServiceRequestDate",
  "LastServiceRequestType",
  "SolarInterestScore",
  "EnergyEfficiencyLeadScore",
  "EVInterest",
  "HeatPumpInterest",
  "GreenEnergySubscription",
  "PaperlessInvoice",
  "ComplaintCountLast24M",
  "ChurnRiskScore",
  "CustomerLifetimeValueEUR",
  "PreferredContactChannel",
  "City",
  "PostalCode",
  "NumberOfEmployees",
  "IndustryCode",
  "LegalForm",
  "Superuser"
];

const demoRows = [
  {
    UserGuid: "eff170a6-a999-48f2-a186-4f25d616f258",
    EmailAddress: "eva.kralova@example.sk",
    CustomerNumber: "10042881",
    AgreementNumber: "ZA-104-882",
    LinkedAdminAgreement: "",
    AdminInvoiced: false,
    AgreementSignupDate: "3/14/2021 9:22:00",
    CustomerSignupDate: "3/14/2021 9:22:00",
    CustomerType: "Household",
    Segment: "Digital household",
    Commodity: "Electricity + Gas",
    ProductName: "Online Domov Duo",
    TariffCode: "DD2-DOM",
    DistributionRegion: "Zilina",
    MeterPointEIC: "24ZSS1048820001Q",
    MeterSerialNumber: "ELM884201",
    SmartMeterInstalled: true,
    MeterReadingFrequency: "Monthly",
    LastMeterReadingDate: "4/30/2026 8:12:00",
    LastMeterReadingValue: 18342,
    AnnualConsumptionKWh: 3120,
    AnnualGasConsumptionM3: 576,
    CurrentAccountingYearEndDate: "12/31/2026 0:00:00",
    InvoiceDeliveryMethod: "Email",
    InvoiceFrequency: "Monthly",
    LastInvoiceDate: "4/30/2026 0:00:00",
    LastInvoiceAmountEUR: 82,
    OutstandingBalanceEUR: 0,
    PaymentMethod: "Direct debit",
    DirectDebitActive: true,
    LatePaymentsLast12M: 0,
    PaymentPlanActive: false,
    MonthlyDepositEUR: 82,
    EZonaRegistered: true,
    EZonaLastLoginDate: "5/13/2026 9:15:00",
    AppUsage: "eZona web",
    MobileAppPlatform: "",
    NewsletterConsent: true,
    MarketingConsent: true,
    OutageNotificationConsent: true,
    PlannedOutageCountLast12M: 1,
    UnplannedOutageCountLast12M: 0,
    OpenServiceRequests: 0,
    LastServiceRequestDate: "2/12/2026 11:05:00",
    LastServiceRequestType: "Meter reading",
    SolarInterestScore: 3,
    EnergyEfficiencyLeadScore: 6,
    EVInterest: false,
    HeatPumpInterest: false,
    GreenEnergySubscription: false,
    PaperlessInvoice: true,
    ComplaintCountLast24M: 0,
    ChurnRiskScore: 2,
    CustomerLifetimeValueEUR: 1840,
    PreferredContactChannel: "Email",
    City: "Zilina",
    PostalCode: "01001",
    NumberOfEmployees: "",
    IndustryCode: "",
    LegalForm: "",
    Superuser: true
  },
  {
    UserGuid: "2d57e1f9-42a6-4c4e-9f0e-cd12b4e6af3a",
    EmailAddress: "martin.benko@example.sk",
    CustomerNumber: "10077219",
    AgreementNumber: "BB-772-119",
    LinkedAdminAgreement: "",
    AdminInvoiced: false,
    AgreementSignupDate: "10/2/2020 14:41:00",
    CustomerSignupDate: "10/2/2020 14:41:00",
    CustomerType: "Household",
    Segment: "Solar interest",
    Commodity: "Electricity",
    ProductName: "Elektrina Domov",
    TariffCode: "DD5-SOLAR",
    DistributionRegion: "Banska Bystrica",
    MeterPointEIC: "24ZSS7721190001K",
    MeterSerialNumber: "ELM772119",
    SmartMeterInstalled: true,
    MeterReadingFrequency: "Monthly",
    LastMeterReadingDate: "4/29/2026 16:30:00",
    LastMeterReadingValue: 30491,
    AnnualConsumptionKWh: 5280,
    AnnualGasConsumptionM3: 0,
    CurrentAccountingYearEndDate: "12/31/2026 0:00:00",
    InvoiceDeliveryMethod: "Email",
    InvoiceFrequency: "Monthly",
    LastInvoiceDate: "4/30/2026 0:00:00",
    LastInvoiceAmountEUR: 126.4,
    OutstandingBalanceEUR: 126.4,
    PaymentMethod: "Card",
    DirectDebitActive: false,
    LatePaymentsLast12M: 1,
    PaymentPlanActive: false,
    MonthlyDepositEUR: 119,
    EZonaRegistered: true,
    EZonaLastLoginDate: "5/12/2026 18:44:00",
    AppUsage: "eZona web, mobile web",
    MobileAppPlatform: "iOS",
    NewsletterConsent: true,
    MarketingConsent: true,
    OutageNotificationConsent: true,
    PlannedOutageCountLast12M: 2,
    UnplannedOutageCountLast12M: 1,
    OpenServiceRequests: 1,
    LastServiceRequestDate: "4/18/2026 10:20:00",
    LastServiceRequestType: "Solar consultation",
    SolarInterestScore: 9,
    EnergyEfficiencyLeadScore: 8,
    EVInterest: true,
    HeatPumpInterest: true,
    GreenEnergySubscription: false,
    PaperlessInvoice: true,
    ComplaintCountLast24M: 1,
    ChurnRiskScore: 4,
    CustomerLifetimeValueEUR: 2760,
    PreferredContactChannel: "Email",
    City: "Banska Bystrica",
    PostalCode: "97401",
    NumberOfEmployees: "",
    IndustryCode: "",
    LegalForm: "",
    Superuser: true
  },
  {
    UserGuid: "77dbe8aa-8f73-49b4-b25e-18ef0f04f8b7",
    EmailAddress: "lucia.urbanova@example.sk",
    CustomerNumber: "20044190",
    AgreementNumber: "MT-441-901",
    LinkedAdminAgreement: "ADM-441-000",
    AdminInvoiced: true,
    AgreementSignupDate: "6/22/2019 8:10:00",
    CustomerSignupDate: "6/22/2019 8:10:00",
    CustomerType: "Business",
    Segment: "SME multi-site",
    Commodity: "Electricity + Gas",
    ProductName: "Firma Energia Plus",
    TariffCode: "B2B-DUO",
    DistributionRegion: "Martin",
    MeterPointEIC: "24ZSS4419010001P",
    MeterSerialNumber: "ELM441901",
    SmartMeterInstalled: true,
    MeterReadingFrequency: "Monthly",
    LastMeterReadingDate: "4/30/2026 7:40:00",
    LastMeterReadingValue: 99240,
    AnnualConsumptionKWh: 17160,
    AnnualGasConsumptionM3: 2520,
    CurrentAccountingYearEndDate: "12/31/2026 0:00:00",
    InvoiceDeliveryMethod: "Email",
    InvoiceFrequency: "Monthly",
    LastInvoiceDate: "4/30/2026 0:00:00",
    LastInvoiceAmountEUR: 438.2,
    OutstandingBalanceEUR: 438.2,
    PaymentMethod: "Bank transfer",
    DirectDebitActive: false,
    LatePaymentsLast12M: 0,
    PaymentPlanActive: true,
    MonthlyDepositEUR: 440,
    EZonaRegistered: true,
    EZonaLastLoginDate: "5/11/2026 13:08:00",
    AppUsage: "eZona web, API",
    MobileAppPlatform: "",
    NewsletterConsent: true,
    MarketingConsent: false,
    OutageNotificationConsent: true,
    PlannedOutageCountLast12M: 3,
    UnplannedOutageCountLast12M: 1,
    OpenServiceRequests: 1,
    LastServiceRequestDate: "4/20/2026 9:35:00",
    LastServiceRequestType: "Deposit change",
    SolarInterestScore: 6,
    EnergyEfficiencyLeadScore: 7,
    EVInterest: false,
    HeatPumpInterest: false,
    GreenEnergySubscription: true,
    PaperlessInvoice: true,
    ComplaintCountLast24M: 0,
    ChurnRiskScore: 3,
    CustomerLifetimeValueEUR: 7680,
    PreferredContactChannel: "Email",
    City: "Martin",
    PostalCode: "03601",
    NumberOfEmployees: 18,
    IndustryCode: "471100",
    LegalForm: "s.r.o.",
    Superuser: true
  }
];

const firstNames = ["Jana", "Peter", "Marek", "Zuzana", "Tomas", "Katarina", "Michal", "Andrea", "Robert", "Monika", "Pavol", "Veronika", "Samuel", "Natalia", "Daniel", "Ivana", "Juraj", "Simona", "Miroslav", "Lenka"];
const lastNames = ["Novakova", "Horvath", "Kovac", "Varga", "Tothova", "Balaz", "Kral", "Marekova", "Polak", "Fedorova", "Simon", "Lackova", "Mikulas", "Bartosova", "Danko", "Simekova", "Urban", "Kollarova", "Halas", "Gregorova"];
const cities = [
  ["Zilina", "01001", "Zilina"],
  ["Banska Bystrica", "97401", "Banska Bystrica"],
  ["Martin", "03601", "Martin"],
  ["Trencin", "91101", "Trencin"],
  ["Prievidza", "97101", "Prievidza"],
  ["Liptovsky Mikulas", "03101", "Liptovsky Mikulas"],
  ["Poprad", "05801", "Poprad"],
  ["Zvolen", "96001", "Zvolen"],
  ["Ruzomberok", "03401", "Ruzomberok"],
  ["Cadca", "02201", "Cadca"]
];
const householdSegments = ["Digital household", "Standard household", "Price sensitive", "Solar interest", "Senior assisted", "High consumption", "Green energy"];
const businessSegments = ["SME multi-site", "Small business", "Public sector", "Industrial", "Retail services", "Hospitality"];
const products = {
  "Electricity": ["Elektrina Domov", "Elektrina Online", "Firma Elektrina Plus", "Verejna Sprava Elektrina"],
  "Gas": ["Plyn Domov", "Plyn Komfort", "Firma Plyn Plus"],
  "Electricity + Gas": ["Online Domov Duo", "Firma Energia Plus", "Duo Komfort"]
};
const tariffs = ["DD1-DOM", "DD2-DOM", "DD5-SOLAR", "DMP1-PLYN", "B2B-DUO", "B2B-ELE", "B2B-GAS", "VS-ELE"];
const paymentMethods = ["Direct debit", "Bank transfer", "Card", "Postal order"];
const serviceTypes = ["Meter reading", "Deposit change", "Move contract", "Contact support", "Tariff consultation", "Solar consultation", "Complaint", "Invoice copy"];
const industries = ["471100", "551000", "561000", "682000", "256200", "852000", "861000", "493200", "620100"];
const legalForms = ["s.r.o.", "a.s.", "zivnostnik", "obec", "neziskova organizacia"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function bool(prob = 0.5) {
  return Math.random() < prob;
}

function dateBetween(start, end) {
  const ts = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ts);
}

function fmtDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}:00`;
}

function money(value) {
  return Math.round(value * 100) / 100;
}

function sanitizeName(value) {
  return value.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

function makeAgreement(region, i) {
  const prefix = region.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase().padEnd(2, "X");
  return `${prefix}-${String(100 + i).padStart(3, "0")}-${String(int(100, 999))}`;
}

function generateRow(i) {
  const isBusiness = bool(0.28);
  const city = pick(cities);
  const first = pick(firstNames);
  const last = pick(lastNames);
  const emailDomain = isBusiness ? pick(["firma.sk", "energia-client.sk", "example-business.sk", "municipal.sk"]) : pick(["gmail.com", "azet.sk", "post.sk", "example.sk"]);
  const email = `${sanitizeName(first)}.${sanitizeName(last)}${i}@${emailDomain}`;
  const segment = isBusiness ? pick(businessSegments) : pick(householdSegments);
  const commodity = pick(["Electricity", "Gas", "Electricity + Gas"]);
  const annualKwh = commodity === "Gas" ? 0 : int(isBusiness ? 8000 : 1200, isBusiness ? 120000 : 9000);
  const annualGas = commodity === "Electricity" ? 0 : int(isBusiness ? 600 : 120, isBusiness ? 14000 : 2200);
  const smartMeter = bool(isBusiness ? 0.72 : 0.58);
  const ezona = bool(0.74);
  const directDebit = bool(0.46);
  const paperless = ezona && bool(0.82);
  const green = bool(segment === "Green energy" ? 0.8 : 0.18);
  const solarScore = segment === "Solar interest" ? int(7, 10) : int(0, 7);
  const efficiencyScore = Math.min(10, Math.max(0, Math.round((annualKwh / (isBusiness ? 12000 : 1200)) + int(1, 6))));
  const signup = dateBetween(new Date("2018-01-01T08:00:00"), new Date("2026-03-31T17:30:00"));
  const lastLogin = ezona ? dateBetween(new Date("2025-01-01T08:00:00"), new Date("2026-05-12T20:00:00")) : null;
  const invoiceAmount = money((annualKwh * 0.00019 + annualGas * 0.055 + (isBusiness ? int(30, 260) : int(18, 75))));
  const latePayments = int(0, bool(0.82) ? 1 : 5);
  const outstanding = bool(0.34) ? money(invoiceAmount * (latePayments > 0 ? Math.random() * 2.4 + 0.4 : Math.random())) : 0;
  const agreement = makeAgreement(city[2], i);
  const productName = pick(products[commodity]);
  const employees = isBusiness ? int(1, segment === "Industrial" ? 250 : 60) : "";

  return {
    UserGuid: crypto.randomUUID(),
    EmailAddress: email,
    CustomerNumber: String(isBusiness ? int(20000000, 29999999) : int(10000000, 19999999)),
    AgreementNumber: agreement,
    LinkedAdminAgreement: isBusiness && bool(0.38) ? `ADM-${int(100, 999)}-${int(100, 999)}` : "",
    AdminInvoiced: isBusiness && bool(0.42),
    AgreementSignupDate: fmtDate(signup),
    CustomerSignupDate: fmtDate(signup),
    CustomerType: isBusiness ? "Business" : "Household",
    Segment: segment,
    Commodity: commodity,
    ProductName: productName,
    TariffCode: pick(tariffs),
    DistributionRegion: city[2],
    MeterPointEIC: `24ZSS${String(int(1000000000, 9999999999))}${pick(["Q", "K", "P", "M"])}`,
    MeterSerialNumber: `${commodity === "Gas" ? "GAS" : "ELM"}${int(100000, 999999)}`,
    SmartMeterInstalled: smartMeter,
    MeterReadingFrequency: smartMeter ? "Monthly" : pick(["Annual", "Quarterly"]),
    LastMeterReadingDate: fmtDate(dateBetween(new Date("2026-03-01T07:00:00"), new Date("2026-05-10T18:00:00"))),
    LastMeterReadingValue: int(1200, isBusiness ? 240000 : 48000),
    AnnualConsumptionKWh: annualKwh,
    AnnualGasConsumptionM3: annualGas,
    CurrentAccountingYearEndDate: "12/31/2026 0:00:00",
    InvoiceDeliveryMethod: paperless ? "Email" : pick(["Post", "Email"]),
    InvoiceFrequency: pick(["Monthly", "Quarterly", "Annual"]),
    LastInvoiceDate: "4/30/2026 0:00:00",
    LastInvoiceAmountEUR: invoiceAmount,
    OutstandingBalanceEUR: outstanding,
    PaymentMethod: directDebit ? "Direct debit" : pick(paymentMethods),
    DirectDebitActive: directDebit,
    LatePaymentsLast12M: latePayments,
    PaymentPlanActive: outstanding > invoiceAmount && bool(0.48),
    MonthlyDepositEUR: money(invoiceAmount * (0.82 + Math.random() * 0.36)),
    EZonaRegistered: ezona,
    EZonaLastLoginDate: lastLogin ? fmtDate(lastLogin) : "",
    AppUsage: ezona ? pick(["eZona web", "eZona web, mobile web", "eZona web, API", "mobile web"]) : "",
    MobileAppPlatform: ezona && bool(0.45) ? pick(["iOS", "Android"]) : "",
    NewsletterConsent: bool(0.52),
    MarketingConsent: bool(0.44),
    OutageNotificationConsent: bool(0.64),
    PlannedOutageCountLast12M: int(0, 5),
    UnplannedOutageCountLast12M: int(0, 3),
    OpenServiceRequests: int(0, bool(0.82) ? 1 : 4),
    LastServiceRequestDate: bool(0.66) ? fmtDate(dateBetween(new Date("2025-01-01T08:00:00"), new Date("2026-05-01T18:00:00"))) : "",
    LastServiceRequestType: pick(serviceTypes),
    SolarInterestScore: solarScore,
    EnergyEfficiencyLeadScore: efficiencyScore,
    EVInterest: bool(isBusiness ? 0.18 : 0.13),
    HeatPumpInterest: bool(0.2),
    GreenEnergySubscription: green,
    PaperlessInvoice: paperless,
    ComplaintCountLast24M: int(0, bool(0.86) ? 1 : 5),
    ChurnRiskScore: Math.min(10, latePayments + int(0, 6) + (outstanding > 0 ? 1 : 0)),
    CustomerLifetimeValueEUR: money(invoiceAmount * int(18, 72)),
    PreferredContactChannel: pick(["Email", "Phone", "SMS", "eZona message"]),
    City: city[0],
    PostalCode: city[1],
    NumberOfEmployees: employees,
    IndustryCode: isBusiness ? pick(industries) : "",
    LegalForm: isBusiness ? pick(legalForms) : "",
    Superuser: ezona && bool(0.78)
  };
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

const rows = [...demoRows];
for (let i = demoRows.length + 1; i <= ROW_COUNT; i += 1) {
  rows.push(generateRow(i));
}

const seen = new Set();
for (const row of rows) {
  if (seen.has(row.UserGuid)) throw new Error(`Duplicate UserGuid: ${row.UserGuid}`);
  seen.add(row.UserGuid);
}

const csv = [
  headers.map(csvEscape).join(","),
  ...rows.map(row => headers.map(header => csvEscape(row[header])).join(","))
].join("\n");

await fs.writeFile(OUTPUT, csv, "utf8");
console.log(`Wrote ${rows.length} rows to ${OUTPUT}`);
console.log(`Unique UserGuid count: ${seen.size}`);
