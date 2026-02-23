const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, 
        ShadingType, VerticalAlign, PageNumber, LevelFormat, PageBreak } = require('docx');
const fs = require('fs');

// Color palette - Industrial style (suitable for construction/engineering)
const colors = {
  primary: "26211F",
  body: "3D3735",
  secondary: "6B6361",
  accent: "C19A6B",
  tableBg: "FDFCFB",
  headerBg: "F1F5F9"
};

const tableBorder = { style: BorderStyle.SINGLE, size: 8, color: colors.primary };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 0, after: 200 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-current",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-phase1",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-phase2",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-phase3",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-phase4",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-phase5",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ 
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "SolTrend Pro - Technical Assessment", color: colors.secondary, size: 18 })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Page ", size: 18 }), new TextRun({ children: [PageNumber.CURRENT], size: 18 }), new TextRun({ text: " of ", size: 18 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 })]
      })] })
    },
    children: [
      // Title
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("SolTrend Pro")] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
        children: [new TextRun({ text: "Technical Assessment & Deployment Roadmap", size: 28, color: colors.secondary })] }),
      
      // Executive Summary
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Executive Summary")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("SolTrend Pro is a solar construction management platform designed for field operations in pile installation and quality control. The current implementation serves as a functional visual prototype with a well-designed user interface, but lacks the infrastructure required for production deployment. This assessment identifies critical gaps between the current mockup state and a deployable, field-ready application, providing a phased roadmap for transformation.")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("The application demonstrates strong UX foundations with intuitive navigation, mobile-optimized layouts, and comprehensive feature coverage for solar construction workflows. However, all data currently exists in browser memory, reports generate via print dialogs rather than persisted documents, and there is no authentication or multi-user support. Converting this prototype to production requires systematic implementation of backend services, database persistence, authentication systems, and offline capabilities.")] }),
      
      // Current State Analysis
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Current State Analysis")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Application Architecture")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("The current architecture consists of a single Next.js application with all logic embedded in a single page.tsx file. The entire application—including state management, UI rendering, data generation, and report creation—runs client-side in the browser. While this approach enabled rapid prototyping, it creates fundamental limitations for production use.")] }),
      
      // Architecture Table
      new Table({
        columnWidths: [3000, 6360],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
                shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Component", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6360, type: WidthType.DXA },
                shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Current Implementation", bold: true })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Frontend", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6360, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Single page.tsx (~1,600 lines), embedded JavaScript, Tailwind CSS via CDN, Lucide icons")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "State Management", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6360, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Global JavaScript object, in-memory only, lost on page refresh")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Data Storage", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6360, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("None - all data generated via generateDemoData() function")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "API Routes", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6360, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("References exist (/api/inspections, /api/refusals) but routes not implemented")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Database", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6360, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Not configured - no Prisma, no schema, no connection")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Authentication", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6360, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("Hardcoded currentUser object, no real auth system")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Reports", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6360, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("window.open() with HTML, generates print dialog, no persistence")] })] })
            ]
          })
        ]
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
        children: [new TextRun({ text: "Table 1: Current Architecture Components", size: 18, italics: true, color: colors.secondary })] }),
      
      // Feature Status
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Feature Implementation Status")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("The application includes a comprehensive feature set for solar construction management, but implementation depth varies significantly. Some features are fully functional UI prototypes while others are placeholder concepts. Understanding this distinction is critical for prioritization.")] }),
      
      new Table({
        columnWidths: [2500, 2000, 4860],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA },
                shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Feature", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA },
                shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Status", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 4860, type: WidthType.DXA },
                shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Gap Description", bold: true })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Company Dashboard")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Mockup", color: "DC2626" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Static demo data, no real company/project management")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("QC Inspection")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Partial", color: "F59E0B" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("UI works, data not persisted, photos stored in memory only")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Refusal Logging")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Partial", color: "F59E0B" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("UI works, no persistence, no resolution workflow")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Pile Map/Heatmap")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Partial", color: "F59E0B" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Visual works, but data is randomly generated, not real")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Production Tracking")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Mockup", color: "DC2626" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Random data generation, no crew assignment logic")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Analytics Dashboard")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Mockup", color: "DC2626" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Charts display fake data, no real calculations")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Report Generation")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Partial", color: "F59E0B" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("HTML reports generate but via print dialog, no PDF storage")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Photo Capture")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Partial", color: "F59E0B" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Camera works, images in base64 memory, no cloud storage")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Weather Integration")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Not Started", color: "6B7280" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Open-Meteo API planned but not implemented")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("User Authentication")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Not Started", color: "6B7280" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Hardcoded user, no login system, no permissions")] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Offline Support")] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Not Started", color: "6B7280" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("No service worker, no IndexedDB, no sync logic")] })] })
            ]
          })
        ]
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
        children: [new TextRun({ text: "Table 2: Feature Implementation Status Assessment", size: 18, italics: true, color: colors.secondary })] }),
      
      // Critical Gaps
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Critical Gaps for Production Deployment")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1. Data Persistence Layer")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("The most fundamental gap is the complete absence of data persistence. Currently, all inspection data, refusal records, production logs, and photos exist only in JavaScript memory. When a user refreshes the page or closes the browser, all data is lost. For a field operations application, this is unacceptable. Field crews cannot risk losing hours of inspection data due to a browser refresh or device restart. The application needs a complete database infrastructure with proper schema design for projects, piles, inspections, refusals, photos, crews, users, and activity logs.")] }),
      new Paragraph({ spacing: { line: 312, after: 100 }, children: [new TextRun({ text: "Required Implementation:", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("PostgreSQL database with Prisma ORM for type-safe queries")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Schema design for multi-tenant company/project structure")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Cloud storage integration (AWS S3 or similar) for photo storage")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312, after: 200 },
        children: [new TextRun("Database migrations and seeding scripts")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2. Authentication and Authorization")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("The application has a hardcoded user object with no actual authentication. Production requires a complete identity management system supporting multiple user roles (admin, project manager, field supervisor, crew lead, inspector), each with appropriate permissions. Field workers need mobile-friendly authentication, while administrators need web dashboard access. The system must support company-level isolation so users from different solar construction companies cannot access each other's data.")] }),
      new Paragraph({ spacing: { line: 312, after: 100 }, children: [new TextRun({ text: "Required Implementation:", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("NextAuth.js integration with JWT sessions")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Role-based access control (RBAC) system")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Multi-tenant data isolation at database level")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312, after: 200 },
        children: [new TextRun("Mobile-optimized login flow with potential biometric support")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3. Offline-First Architecture")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("Solar construction sites are often in remote locations with unreliable cellular connectivity. The current application has no offline support whatsoever. Field crews need to continue inspections and log refusals even without internet access, with automatic synchronization when connectivity is restored. This requires a fundamental architecture shift to offline-first design, implementing service workers, IndexedDB for local storage, and conflict resolution logic for sync scenarios.")] }),
      new Paragraph({ spacing: { line: 312, after: 100 }, children: [new TextRun({ text: "Required Implementation:", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Service Worker for offline page caching")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("IndexedDB for local inspection/refusal storage")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Background sync API for automatic data upload")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312, after: 200 },
        children: [new TextRun("Conflict resolution strategy for simultaneous edits")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4. Report Persistence and Distribution")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("The current report system generates HTML content in a new browser window and triggers the print dialog. While functional for quick printing, this approach does not meet enterprise requirements. Reports need to be generated as properly formatted PDF documents, stored in cloud storage, associated with projects and date ranges, and shareable via secure links. The system should maintain a report history and support automated report generation and distribution schedules.")] }),
      new Paragraph({ spacing: { line: 312, after: 100 }, children: [new TextRun({ text: "Required Implementation:", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Server-side PDF generation (Puppeteer or similar)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Cloud storage for PDF archival")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Report scheduling and automated distribution")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312, after: 200 },
        children: [new TextRun("Email integration for report delivery")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5. Mobile Field Experience")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("While the UI is mobile-responsive, the application is not optimized for true field use. Field workers wearing gloves need large touch targets, high contrast for bright sunlight visibility, and streamlined workflows that minimize data entry. The photo capture needs GPS metadata embedding, timestamp watermarking, and efficient compression for upload over slow connections. Additionally, barcode/QR code scanning for pile identification could dramatically speed up the inspection process.")] }),
      new Paragraph({ spacing: { line: 312, after: 100 }, children: [new TextRun({ text: "Required Implementation:", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Progressive Web App (PWA) installation support")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("QR/Barcode scanning for pile identification")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("High-contrast outdoor mode")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { line: 312, after: 200 },
        children: [new TextRun("Batch operation mode for rapid sequential inspections")] }),
      
      // Phased Roadmap
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Phased Implementation Roadmap")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("The following roadmap breaks down the transformation into five distinct phases, each building upon the previous and delivering incremental value. This approach allows for early field testing while continuing development, reducing overall project risk and enabling course corrections based on real-world feedback.")] }),
      
      // Phase 1
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Phase 1: Foundation (Weeks 1-3)")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("This phase establishes the core infrastructure required for any production application. The focus is on database setup, basic API routes, and authentication scaffolding. By the end of this phase, users should be able to log in and see real (even if minimal) data from the database.")] }),
      new Paragraph({ spacing: { line: 312, after: 100 }, children: [new TextRun({ text: "Deliverables:", bold: true })] }),
      new Paragraph({ numbering: { reference: "numbered-phase1", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("PostgreSQL database setup with Railway or Neon")] }),
      new Paragraph({ numbering: { reference: "numbered-phase1", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Prisma schema design for core entities (User, Company, Project, Pile, Inspection, Refusal)")] }),
      new Paragraph({ numbering: { reference: "numbered-phase1", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Basic API routes for CRUD operations on all entities")] }),
      new Paragraph({ numbering: { reference: "numbered-phase1", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("NextAuth.js integration with email/password authentication")] }),
      new Paragraph({ numbering: { reference: "numbered-phase1", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Basic login page and session management")] }),
      new Paragraph({ numbering: { reference: "numbered-phase1", level: 0 }, spacing: { line: 312, after: 200 },
        children: [new TextRun("Company registration and project creation flows")] }),
      
      // Phase 2
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Phase 2: Core Functionality (Weeks 4-6)")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("With the foundation in place, Phase 2 focuses on making the primary workflows functional. QC inspection and refusal logging become fully operational with real data persistence. The pile map displays actual inspection status rather than random demo data.")] }),
      new Paragraph({ spacing: { line: 312, after: 100 }, children: [new TextRun({ text: "Deliverables:", bold: true })] }),
      new Paragraph({ numbering: { reference: "numbered-phase2", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Functional QC inspection workflow with database persistence")] }),
      new Paragraph({ numbering: { reference: "numbered-phase2", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Refusal logging with full detail capture and storage")] }),
      new Paragraph({ numbering: { reference: "numbered-phase2", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Real-time pile map reflecting actual inspection status")] }),
      new Paragraph({ numbering: { reference: "numbered-phase2", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("AWS S3 integration for photo upload and storage")] }),
      new Paragraph({ numbering: { reference: "numbered-phase2", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Photo metadata capture (GPS, timestamp, device info)")] }),
      new Paragraph({ numbering: { reference: "numbered-phase2", level: 0 }, spacing: { line: 312, after: 200 },
        children: [new TextRun("Basic production logging functionality")] }),
      
      // Phase 3
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Phase 3: Reporting & Analytics (Weeks 7-9)")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("Phase 3 transforms the reporting system from print-based HTML to professional PDF documents with cloud storage and distribution capabilities. Analytics dashboards begin showing real data aggregations rather than mock values.")] }),
      new Paragraph({ spacing: { line: 312, after: 100 }, children: [new TextRun({ text: "Deliverables:", bold: true })] }),
      new Paragraph({ numbering: { reference: "numbered-phase3", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Server-side PDF generation using Puppeteer")] }),
      new Paragraph({ numbering: { reference: "numbered-phase3", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Report storage in cloud with retrieval API")] }),
      new Paragraph({ numbering: { reference: "numbered-phase3", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Email distribution via SendGrid or similar")] }),
      new Paragraph({ numbering: { reference: "numbered-phase3", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Real analytics calculations from database queries")] }),
      new Paragraph({ numbering: { reference: "numbered-phase3", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Weather API integration (Open-Meteo) for reports")] }),
      new Paragraph({ numbering: { reference: "numbered-phase3", level: 0 }, spacing: { line: 312, after: 200 },
        children: [new TextRun("Scheduled report generation and distribution")] }),
      
      // Phase 4
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Phase 4: Offline & Mobile (Weeks 10-12)")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("The most technically complex phase, Phase 4 implements offline-first architecture enabling field operations in areas without connectivity. This includes Progressive Web App features, local storage, and intelligent synchronization.")] }),
      new Paragraph({ spacing: { line: 312, after: 100 }, children: [new TextRun({ text: "Deliverables:", bold: true })] }),
      new Paragraph({ numbering: { reference: "numbered-phase4", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Service Worker implementation for offline caching")] }),
      new Paragraph({ numbering: { reference: "numbered-phase4", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("IndexedDB integration for local data storage")] }),
      new Paragraph({ numbering: { reference: "numbered-phase4", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Background sync for automatic data upload")] }),
      new Paragraph({ numbering: { reference: "numbered-phase4", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("PWA manifest and installability")] }),
      new Paragraph({ numbering: { reference: "numbered-phase4", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("QR code scanning for pile identification")] }),
      new Paragraph({ numbering: { reference: "numbered-phase4", level: 0 }, spacing: { line: 312, after: 200 },
        children: [new TextRun("High-contrast outdoor visibility mode")] }),
      
      // Phase 5
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Phase 5: Enterprise Features (Weeks 13-16)")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("The final phase adds enterprise-grade features for multi-company deployment, advanced analytics, and system integrations. This positions the application for commercial SaaS deployment or enterprise licensing.")] }),
      new Paragraph({ spacing: { line: 312, after: 100 }, children: [new TextRun({ text: "Deliverables:", bold: true })] }),
      new Paragraph({ numbering: { reference: "numbered-phase5", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Multi-tenant architecture with complete data isolation")] }),
      new Paragraph({ numbering: { reference: "numbered-phase5", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Role-based access control with granular permissions")] }),
      new Paragraph({ numbering: { reference: "numbered-phase5", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Company-level customization (branding, tolerances)")] }),
      new Paragraph({ numbering: { reference: "numbered-phase5", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("API for third-party integrations")] }),
      new Paragraph({ numbering: { reference: "numbered-phase5", level: 0 }, spacing: { line: 312 },
        children: [new TextRun("Audit logging for compliance requirements")] }),
      new Paragraph({ numbering: { reference: "numbered-phase5", level: 0 }, spacing: { line: 312, after: 200 },
        children: [new TextRun("Performance optimization and load testing")] }),
      
      // Technical Recommendations
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Technical Recommendations")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Recommended Technology Stack")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("Based on the current Next.js foundation and the requirements identified above, the following technology stack is recommended. This selection prioritizes developer productivity, type safety, and deployment simplicity on Railway or similar platforms.")] }),
      
      new Table({
        columnWidths: [2500, 2500, 4360],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA },
                shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Layer", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA },
                shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Technology", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 4360, type: WidthType.DXA },
                shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Rationale", bold: true })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Framework")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Next.js 14+")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Current foundation, App Router, server components")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Database")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("PostgreSQL")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Industry standard, JSON support, excellent tooling")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("ORM")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Prisma")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Type-safe queries, migrations, excellent DX")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Authentication")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("NextAuth.js")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Built for Next.js, multiple providers, session mgmt")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("File Storage")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("AWS S3")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Scalable, CDN integration, presigned URLs")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("PDF Generation")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Puppeteer")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Headless Chrome, accurate rendering, powerful")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Email")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("SendGrid")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Transactional email, templates, analytics")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Hosting")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Railway")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Current deployment, database included, simple")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Offline Storage")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("IndexedDB + Dexie")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Browser database, Dexie for friendly API")] })] })
          ]})
        ]
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
        children: [new TextRun({ text: "Table 3: Recommended Technology Stack", size: 18, italics: true, color: colors.secondary })] }),
      
      // Estimated Effort
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Estimated Development Effort")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("The following estimates assume a single full-stack developer working full-time. Timelines can be compressed with additional resources, though coordination overhead should be factored in.")] }),
      
      new Table({
        columnWidths: [3500, 2000, 3860],
        margins: { top: 100, bottom: 100, left: 180, right: 180 },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA },
                shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phase", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA },
                shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Duration", bold: true })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 3860, type: WidthType.DXA },
                shading: { fill: colors.headerBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Complexity", bold: true })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Phase 1: Foundation")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("3 weeks")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Medium - infrastructure setup")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Phase 2: Core Functionality")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("3 weeks")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Medium-High - workflow logic")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Phase 3: Reporting & Analytics")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("3 weeks")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Medium - PDF generation, queries")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Phase 4: Offline & Mobile")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("3 weeks")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("High - complex sync logic")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Phase 5: Enterprise Features")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("4 weeks")] })] }),
            new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun("Medium - security, multi-tenancy")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Total Estimated Duration", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "16 weeks", bold: true })] })] }),
            new TableCell({ borders: cellBorders, shading: { fill: colors.headerBg, type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "~4 months to production-ready", bold: true })] })] })
          ]})
        ]
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
        children: [new TextRun({ text: "Table 4: Development Timeline Estimates", size: 18, italics: true, color: colors.secondary })] }),
      
      // Conclusion
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Conclusion and Next Steps")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("SolTrend Pro has a solid foundation with a well-designed user interface and comprehensive feature coverage for solar construction management. The transition from prototype to production is achievable within a 16-week timeframe following the phased approach outlined above. The most critical priority is establishing the data persistence layer, as all other functionality depends on reliable data storage and retrieval.")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("The immediate recommendation is to begin Phase 1 by setting up a PostgreSQL database, designing the Prisma schema, and implementing basic API routes. This foundation will enable iterative development of subsequent features while allowing for early testing with real data. The existing UI can remain largely unchanged during this process, requiring only modifications to connect to the new backend services.")] }),
      new Paragraph({ spacing: { line: 312, after: 200 },
        children: [new TextRun("Upon completion of the full roadmap, SolTrend Pro will be positioned as a comprehensive, enterprise-ready solution for solar construction field operations, supporting offline use, multi-company deployment, and professional reporting capabilities that meet the demands of utility-scale solar installation projects.")] })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/SolTrend_Pro_Technical_Assessment.docx", buffer);
  console.log("Document created: /home/z/my-project/download/SolTrend_Pro_Technical_Assessment.docx");
});
