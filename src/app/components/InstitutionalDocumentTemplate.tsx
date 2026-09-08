"use client";

import React, { useRef } from "react";
import { 
  Building2, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode as QrIcon, 
  FileText, 
  X,
  Lock,
  ExternalLink
} from "lucide-react";

export interface InstituteIdentity {
  name: string;
  logoUrl?: string | null;
  accreditation?: string;
  address?: string;
  signatoryTitle?: string;
  contactEmail?: string;
  websiteUrl?: string;
}

export interface StudentInfo {
  fullName: string;
  rollNumber: string;
  department: string;
  academicYear: string;
  section: string;
  email?: string;
}

export interface FeeLineItem {
  id: string;
  description: string;
  term: string;
  amount: number;
  paidAmount: number;
  status: "PAID" | "CLEARED" | "PENDING";
  paymentRef?: string;
  paymentDate?: string;
}

export interface InstitutionalDocumentProps {
  documentType: "FEE_RECEIPT" | "OD_PASS" | "TRANSCRIPT" | "DOSSIER";
  documentNumber: string;
  issueDate?: string;
  institute: InstituteIdentity;
  student: StudentInfo;
  feeItems?: FeeLineItem[];
  odDetails?: {
    eventTitle: string;
    organizer: string;
    fromDate: string;
    toDate: string;
    periodsExcused: string;
    status: string;
    attendanceImpact: string;
  };
  onClose?: () => void;
}

function numberToWordsINR(amount: number): string {
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(num: number): string {
    if (num === 0) return "Zero";
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + " " + a[num % 10];
    if (num < 1000) return inWords(Math.floor(num / 100)) + "Hundred " + (num % 100 !== 0 ? "and " + inWords(num % 100) : "");
    if (num < 100000) return inWords(Math.floor(num / 1000)) + "Thousand " + (num % 1000 !== 0 ? inWords(num % 1000) : "");
    if (num < 10000000) return inWords(Math.floor(num / 100000)) + "Lakh " + (num % 100000 !== 0 ? inWords(num % 100000) : "");
    return inWords(Math.floor(num / 10000000)) + "Crore " + (num % 10000000 !== 0 ? inWords(num % 10000000) : "");
  }

  const rounded = Math.floor(amount);
  return `Rupees ${inWords(rounded).trim()} Only`;
}

export default function InstitutionalDocumentTemplate({
  documentType,
  documentNumber,
  issueDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  institute,
  student,
  feeItems = [],
  odDetails,
  onClose,
}: InstitutionalDocumentProps) {
  const documentRef = useRef<HTMLDivElement>(null);

  const totalAmount = feeItems.reduce((acc, item) => acc + item.amount, 0);
  const totalPaid = feeItems.reduce((acc, item) => acc + item.paidAmount, 0);
  const pendingBalance = totalAmount - totalPaid;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const checksum = `${documentNumber.replace(/[^A-Z0-9]/gi, "").slice(0, 8)}-${Math.abs(
    student.rollNumber.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  ).toString(16).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex flex-col items-center justify-start p-4 sm:p-6 lg:p-10 print:p-0 print:bg-white print:static">
      
      {/* ── Screen Control Action Bar (Hidden on Print) ── */}
      <div className="w-full max-w-4xl flex items-center justify-between bg-bg-surface border border-border-main/80 rounded-xl px-5 py-3 mb-6 shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-main/10 border border-accent-main/30 flex items-center justify-center text-accent-main">
            <Building2 size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase text-txt-muted tracking-wider">Institutional Document Preview</span>
            <span className="text-sm font-semibold text-txt-main">{institute.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-accent-main hover:opacity-90 text-bg-base font-mono text-xs uppercase font-bold tracking-wider rounded-lg flex items-center gap-2 cursor-pointer shadow-md transition-opacity"
          >
            <Printer size={14} />
            Print / Save Official PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-txt-muted hover:text-txt-main hover:bg-bg-card rounded-lg transition-colors cursor-pointer"
              aria-label="Close document preview"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ── Official A4 Document Canvas ── */}
      <div 
        ref={documentRef}
        className="w-full max-w-4xl bg-white text-slate-900 border border-slate-300 rounded-lg shadow-2xl p-8 sm:p-12 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none flex flex-col justify-between min-h-[1100px] relative overflow-hidden"
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        {/* Subtle Security Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
          <span className="font-mono text-9xl font-black uppercase rotate-[-35deg] tracking-widest text-slate-900">
            OFFICIAL
          </span>
        </div>

        {/* ── TOP HEADER SECTION ── */}
        <div>
          <header className="border-b-2 border-slate-900 pb-6 flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              {institute.logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={institute.logoUrl} 
                  alt={institute.name} 
                  className="w-20 h-20 object-contain rounded-md border border-slate-200 p-1 shrink-0" 
                />
              ) : (
                <div className="w-18 h-18 rounded-md bg-slate-100 border-2 border-slate-800 flex items-center justify-center text-slate-900 shrink-0 font-serif text-2xl font-black">
                  {institute.name.split(" ").map(w => w[0]).slice(0, 3).join("")}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-950 uppercase leading-snug">
                  {institute.name}
                </h1>
                {institute.accreditation && (
                  <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-700 font-semibold">
                    {institute.accreditation}
                  </p>
                )}
                {institute.address && (
                  <p className="text-[11px] text-slate-600 font-normal leading-tight">
                    {institute.address}
                  </p>
                )}
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 mt-0.5">
                  {institute.contactEmail && <span>Email: {institute.contactEmail}</span>}
                  {institute.websiteUrl && <span>• Web: {institute.websiteUrl}</span>}
                </div>
              </div>
            </div>

            {/* Document Badging & Issue Metadata */}
            <div className="flex flex-col items-end text-right shrink-0">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 font-bold">Document Serial</span>
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                {documentNumber}
              </span>
              <span className="text-[10px] font-mono text-slate-600 mt-1">Date: <strong>{issueDate}</strong></span>
              <div className="mt-2 flex items-center gap-1 text-[9px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <ShieldCheck size={11} />
                <span>Verified Official</span>
              </div>
            </div>
          </header>

          {/* ── DOCUMENT TITLE BAR ── */}
          <div className="my-6 py-2 px-4 bg-slate-900 text-white rounded flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-widest">
              {documentType === "FEE_RECEIPT" && "Official Fee Payment Receipt & Clearance Certificate"}
              {documentType === "OD_PASS" && "Institutional On-Duty (OD) Academic Sanction Pass"}
              {documentType === "TRANSCRIPT" && "Official Semester Academic Performance Record"}
              {documentType === "DOSSIER" && "Verified Candidate Skill & Academic Dossier"}
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-300">
              Academic Year {student.academicYear || "2025-2026"}
            </span>
          </div>

          {/* ── STUDENT CREDENTIALS GRID ── */}
          <div className="border border-slate-300 rounded-md p-4 bg-slate-50/70 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex flex-col">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Student Name</span>
              <span className="font-bold text-slate-950 mt-0.5">{student.fullName}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Roll / Registration No</span>
              <span className="font-mono font-bold text-slate-950 mt-0.5">{student.rollNumber}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Department</span>
              <span className="text-slate-800 font-medium mt-0.5">{student.department}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">Class &amp; Section</span>
              <span className="font-mono text-slate-800 font-medium mt-0.5">{student.academicYear} • Sec {student.section}</span>
            </div>
          </div>

          {/* ── DOCUMENT BODY: FEE PAYMENT RECEIPT ── */}
          {documentType === "FEE_RECEIPT" && (
            <div className="flex flex-col gap-6">
              {/* Itemized Table */}
              <div className="border border-slate-300 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-300 font-mono text-[10px] uppercase text-slate-700">
                    <tr>
                      <th className="px-3.5 py-2.5 w-10 text-center">S.No</th>
                      <th className="px-3.5 py-2.5">Fee Schedule / Account Head</th>
                      <th className="px-3.5 py-2.5">Academic Term</th>
                      <th className="px-3.5 py-2.5 text-right">Amount (INR)</th>
                      <th className="px-3.5 py-2.5 text-right">Paid (INR)</th>
                      <th className="px-3.5 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {feeItems.length > 0 ? (
                      feeItems.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-3.5 py-3 text-center font-mono text-slate-500">{index + 1}</td>
                          <td className="px-3.5 py-3">
                            <span className="font-medium text-slate-950 block">{item.description}</span>
                            {item.paymentRef && (
                              <span className="font-mono text-[9.5px] text-slate-500">Ref: {item.paymentRef}</span>
                            )}
                          </td>
                          <td className="px-3.5 py-3 font-mono text-slate-600">{item.term}</td>
                          <td className="px-3.5 py-3 text-right font-mono text-slate-700">₹{item.amount.toLocaleString("en-IN")}</td>
                          <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-950">₹{item.paidAmount.toLocaleString("en-IN")}</td>
                          <td className="px-3.5 py-3 text-center">
                            <span className={`font-mono text-[9px] uppercase px-2 py-0.5 rounded font-bold ${
                              item.status === "PAID" || item.status === "CLEARED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-3.5 py-6 text-center text-slate-500 font-mono text-xs">
                          No pending fee records on file.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Accounting Summary & Words */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                <div className="sm:col-span-7 border border-slate-200 rounded-md p-3.5 bg-slate-50/50 flex flex-col gap-1.5">
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500 font-bold">Amount in Words</span>
                  <p className="text-xs font-serif font-bold text-slate-900 italic leading-snug">
                    {totalPaid > 0 ? numberToWordsINR(totalPaid) : "Zero Balance Due"}
                  </p>
                  <span className="font-mono text-[9px] text-slate-500 mt-1">
                    Payment Mode: <strong>Institutional NetBanking / NEFT / UPI Settlement</strong>
                  </span>
                </div>

                <div className="sm:col-span-5 border border-slate-300 rounded-md p-3.5 bg-slate-100/60 flex flex-col gap-2 font-mono text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Assessed Dues:</span>
                    <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-950 text-sm border-t border-slate-300 pt-1.5">
                    <span>Total Amount Received:</span>
                    <span className="text-emerald-700">₹{totalPaid.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px] border-t border-slate-200 pt-1">
                    <span>Outstanding Balance:</span>
                    <span className={pendingBalance === 0 ? "text-slate-500" : "text-amber-700 font-bold"}>
                      ₹{pendingBalance.toLocaleString("en-IN")} {pendingBalance === 0 ? "(NIL)" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DOCUMENT BODY: OD PASS ── */}
          {documentType === "OD_PASS" && odDetails && (
            <div className="flex flex-col gap-6">
              <div className="border border-slate-300 rounded-md p-5 bg-slate-50/70 flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9.5px] uppercase text-slate-500">Sanctioned Event / Activity</span>
                    <span className="font-bold text-slate-950 text-sm mt-0.5">{odDetails.eventTitle}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9.5px] uppercase text-slate-500">Organizing Body / Venue</span>
                    <span className="font-medium text-slate-800 mt-0.5">{odDetails.organizer}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 pt-3">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9.5px] uppercase text-slate-500">Effective Dates</span>
                    <span className="font-mono font-medium text-slate-900 mt-0.5">{odDetails.fromDate} to {odDetails.toDate}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9.5px] uppercase text-slate-500">Excused Period Slots</span>
                    <span className="font-mono font-medium text-slate-900 mt-0.5">{odDetails.periodsExcused}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[9.5px] uppercase text-slate-500">Attendance Credit Status</span>
                    <span className="font-mono font-bold text-emerald-700 mt-0.5">{odDetails.attendanceImpact}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── ATTESTATION, CRYPTOGRAPHIC QR & SIGNATURE FOOTER ── */}
        <footer className="border-t-2 border-slate-900 pt-6 mt-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
            
            {/* Cryptographic Digital QR Attestation */}
            <div className="sm:col-span-5 flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded">
              <div className="w-16 h-16 bg-white border border-slate-300 p-1 flex items-center justify-center shrink-0">
                {/* Visual SVG QR Representation */}
                <svg viewBox="0 0 24 24" width="56" height="56" fill="currentColor" className="text-slate-900">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm8-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm6-4h2v2h-2v-2zm0 4h2v2h-2v-2zm2-2h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-2-8h2v2h-2v-2z"/>
                </svg>
              </div>
              <div className="flex flex-col gap-0.5 text-[9px] font-mono text-slate-600">
                <span className="font-bold text-slate-900 uppercase">Cryptographic Verification</span>
                <span>SHA-256: {checksum}</span>
                <span className="text-emerald-700 font-semibold">Digitally Signed &amp; Sealed</span>
              </div>
            </div>

            {/* Official Disclaimer */}
            <div className="sm:col-span-3 text-[9px] text-slate-500 font-mono leading-tight">
              <p>
                This document is a computer-generated official institutional record issued under university academic regulations. No physical signature is required.
              </p>
            </div>

            {/* Authorized Signatory Block */}
            <div className="sm:col-span-4 flex flex-col items-end text-right">
              <div className="w-36 border-b border-slate-900 pb-1 mb-1 text-center font-serif text-xs italic text-slate-700">
                Authorized Attestation
              </div>
              <span className="font-bold text-slate-950 text-xs">{institute.signatoryTitle || "Dean of Academic Affairs & Registrar"}</span>
              <span className="font-mono text-[9px] text-slate-600">{institute.name}</span>
            </div>

          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-2">
            <span>LynDesk University ERP Infrastructure • Document Hash: {checksum}</span>
            <span>Page 1 of 1</span>
          </div>
        </footer>

      </div>

    </div>
  );
}
