/**
 * File Service for PDF Generation
 * Uses pdfkit to create professional visa documents
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * Generate a PDF document from text content
 * @param {string} content - The text content to include in the PDF
 * @param {Object} metadata - Document metadata (title, author, etc.)
 * @param {string} outputPath - Path where PDF should be saved
 * @returns {Promise<string>} Path to the generated PDF
 */
async function generatePDF(content, metadata, outputPath) {
  console.log('***************************************content', content)

  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 72,    // 1 inch
          bottom: 72,
          left: 72,
          right: 72
        }
      });

      // Pipe to file
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // Add document metadata
      doc.info.Title = metadata.title || 'Visa Document';
      doc.info.Author = metadata.author || 'Agentic VISA Assistant';
      doc.info.Subject = metadata.subject || 'Visa Application Document';
      doc.info.CreationDate = new Date();

      // Add header
      addHeader(doc, metadata.title || 'Visa Document');

      // Add content
      doc.moveDown(2);
      
      // Split content into paragraphs and format
      const paragraphs = content.split('\n');
      paragraphs.forEach((paragraph, index) => {
        if (paragraph.trim()) {
          const trimmed = paragraph.trim();
          
          // Check if it's a day header (e.g., "Day 6 - 2026-05-28")
          const isDayHeader = /^Day \d+\s*-/.test(trimmed);
          
          // Check if it's a section header (short line, all caps, or starts with ##)
          const isSectionHeader = (trimmed.length < 50 && trimmed.toUpperCase() === trimmed) ||
                                  trimmed.startsWith('##') ||
                                  trimmed.startsWith('Travel Itinerary');
          
          if (isDayHeader || isSectionHeader) {
            // Bold for day headers and section headers
            doc.font('Helvetica-Bold')
               .fontSize(12)
               .text(trimmed.replace(/^##\s*/, ''), { align: 'left' });
            doc.moveDown(0.5);
            // Reset to regular font after header
            doc.font('Helvetica').fontSize(11);
          } else {
            // Check if line contains time indicators (Morning:, Afternoon:, Evening:)
            const timeIndicatorMatch = trimmed.match(/^(\*\s*)?(Morning|Afternoon|Evening|Night):\s*(.+)$/);
            
            if (timeIndicatorMatch) {
              // Extract parts: bullet (if any), time indicator, and description
              const bullet = timeIndicatorMatch[1] || '';
              const timeIndicator = timeIndicatorMatch[2];
              const description = timeIndicatorMatch[3];
              
              // Write bullet (if present) in regular font
              if (bullet) {
                doc.font('Helvetica').fontSize(11).text(bullet, { continued: true });
              }
              
              // Write time indicator in bold
              doc.font('Helvetica-Bold').fontSize(11).text(`${timeIndicator}: `, { continued: true });
              
              // Write description in regular font
              doc.font('Helvetica').fontSize(11).text(description);
              doc.moveDown(0.5);
            } else {
              // Regular text for all other content
              doc.font('Helvetica')
                 .fontSize(11)
                 .text(trimmed, { align: 'left' });
              doc.moveDown(0.5);
            }
          }
        }
      });

      // Add footer
      addFooter(doc, metadata.footer || `Generated on ${new Date().toLocaleDateString()}`);

      // Finalize the PDF
      doc.end();

      // Wait for write to complete
      writeStream.on('finish', () => {
        console.log(`PDF generated: ${outputPath}`);
        resolve(outputPath);
      });

      writeStream.on('error', (error) => {
        reject(new Error(`Failed to write PDF: ${error.message}`));
      });

    } catch (error) {
      reject(new Error(`Failed to generate PDF: ${error.message}`));
    }
  });
}

/**
 * Add header to PDF document
 * @param {PDFDocument} doc - The PDF document
 * @param {string} title - Header title
 */
function addHeader(doc, title) {
  doc.font('Helvetica-Bold')
     .fontSize(16)
     .text(title, { align: 'center' });
  
  doc.moveDown(0.5);
  
  // Add horizontal line
  doc.moveTo(72, doc.y)
     .lineTo(540, doc.y)
     .stroke();
  
  doc.moveDown(1);
}

/**
 * Add footer to PDF document
 * @param {PDFDocument} doc - The PDF document
 * @param {string} text - Footer text
 */
function addFooter(doc, text) {
  const bottomMargin = 72;
  const pageHeight = doc.page.height;
  
  doc.fontSize(9)
     .font('Helvetica')
     .text(text, 72, pageHeight - bottomMargin, {
       align: 'center',
       width: 468
     });
}

/**
 * Generate cover letter PDF
 * @param {string} coverLetterText - Generated cover letter text
 * @param {Object} travelerInfo - Traveler information for metadata
 * @param {string} outputDir - Directory to save the PDF
 * @returns {Promise<string>} Path to generated PDF
 */
async function generateCoverLetterPDF(coverLetterText, travelerInfo, outputDir) {
  const fileName = `cover-letter-${travelerInfo.fullName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, fileName);

  const metadata = {
    title: 'Visa Application Cover Letter',
    author: travelerInfo.fullName,
    subject: `Visa Application for ${travelerInfo.destination}`,
    footer: `Cover Letter for ${travelerInfo.fullName} - Generated ${new Date().toLocaleDateString()}`
  };

  await generatePDF(coverLetterText, metadata, outputPath);
  return outputPath;
}

/**
 * Generate itinerary PDF
 * @param {string} itineraryText - Generated itinerary text
 * @param {Object} travelerInfo - Traveler information for metadata
 * @param {string} outputDir - Directory to save the PDF
 * @returns {Promise<string>} Path to generated PDF
 */
async function generateItineraryPDF(itineraryText, travelerInfo, outputDir) {
  const fileName = `itinerary-${travelerInfo.fullName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, fileName);

  const metadata = {
    title: 'Travel Itinerary',
    author: travelerInfo.fullName,
    subject: `Travel Itinerary for ${travelerInfo.destination}`,
    footer: `Itinerary for ${travelerInfo.fullName} - Generated ${new Date().toLocaleDateString()}`
  };

  await generatePDF(itineraryText, metadata, outputPath);
  return outputPath;
}

/**
 * Generate complete visa package (cover letter + itinerary) and create a ZIP archive
 * @param {Object} documents - Object containing coverLetter and itinerary text
 * @param {Object} travelerInfo - Traveler information
 * @param {string} outputDir - Directory to save files
 * @returns {Promise<Object>} Object with paths to individual PDFs and ZIP archive
 */
async function generateCompletePackage(documents, travelerInfo, outputDir) {
  try {
    // Generate both PDFs
    const coverLetterPath = await generateCoverLetterPDF(
      documents.coverLetter,
      travelerInfo,
      outputDir
    );

    const itineraryPath = await generateItineraryPDF(
      documents.itinerary,
      travelerInfo,
      outputDir
    );

    // Create ZIP archive
    const zipFileName = `visa-package-${travelerInfo.fullName.replace(/\s+/g, '-')}-${Date.now()}.zip`;
    const zipPath = path.join(outputDir, zipFileName);

    await createZipArchive([coverLetterPath, itineraryPath], zipPath);

    return {
      coverLetterPath,
      itineraryPath,
      zipPath,
      travelerName: travelerInfo.fullName,
      destination: travelerInfo.destination
    };
  } catch (error) {
    throw new Error(`Failed to generate complete package: ${error.message}`);
  }
}

/**
 * Create a ZIP archive from multiple files
 * @param {Array<string>} filePaths - Array of file paths to include in archive
 * @param {string} outputPath - Path for the output ZIP file
 * @returns {Promise<string>} Path to created ZIP file
 */
async function createZipArchive(filePaths, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
      console.log(`ZIP archive created: ${outputPath} (${archive.pointer()} bytes)`);
      resolve(outputPath);
    });

    archive.on('error', (error) => {
      reject(new Error(`Failed to create ZIP archive: ${error.message}`));
    });

    archive.pipe(output);

    // Add files to archive
    filePaths.forEach(filePath => {
      const fileName = path.basename(filePath);
      archive.file(filePath, { name: fileName });
    });

    archive.finalize();
  });
}

/**
 * Get PDF as buffer (for direct HTTP response)
 * @param {string} content - Text content
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Buffer>} PDF buffer
 */
async function generatePDFBuffer(content, metadata) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 72, bottom: 72, left: 72, right: 72 }
      });

      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Add metadata
      doc.info.Title = metadata.title || 'Visa Document';
      doc.info.Author = metadata.author || 'Agentic VISA Assistant';

      // Add header
      addHeader(doc, metadata.title || 'Visa Document');
      doc.moveDown(2);

      // Add content
      const paragraphs = content.split('\n\n');
      paragraphs.forEach(paragraph => {
        if (paragraph.trim()) {
          if (paragraph.trim().toUpperCase() === paragraph.trim() || paragraph.trim().startsWith('Day ')) {
            doc.font('Helvetica-Bold').fontSize(12).text(paragraph.trim(), { align: 'left' });
            doc.moveDown(0.5);
          } else {
            doc.font('Helvetica').fontSize(11).text(paragraph.trim(), { align: 'justify' });
            doc.moveDown(1);
          }
        }
      });

      // Add footer
      addFooter(doc, metadata.footer || `Generated on ${new Date().toLocaleDateString()}`);

      doc.end();
    } catch (error) {
      reject(new Error(`Failed to generate PDF buffer: ${error.message}`));
    }
  });
}

/**
 * Create an individual PDF for a specific request with unique folder structure
 * @param {string} requestId - Unique identifier for the request
 * @param {string} travelerName - Name of the traveler
 * @param {string} documentType - Type of document ('cover-letter' or 'itinerary')
 * @param {string} content - Document content
 * @param {string} baseDir - Base directory for downloads (default: public/downloads)
 * @returns {Promise<string>} URL path to the generated PDF
 */
async function createIndividualPDF(requestId, travelerName, documentType, content, baseDir = 'public/downloads') {
  return new Promise((resolve, reject) => {
    try {
      // Create unique folder for this request
      const requestFolder = path.join(baseDir, requestId);
      
      // Ensure the request folder exists
      if (!fs.existsSync(requestFolder)) {
        fs.mkdirSync(requestFolder, { recursive: true });
        console.log(`✓ Created request folder: ${requestFolder}`);
      }

      // Generate filename
      const sanitizedName = travelerName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
      const timestamp = Date.now();
      const fileName = `${documentType}-${sanitizedName}-${timestamp}.pdf`;
      const filePath = path.join(requestFolder, fileName);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 72,    // 1 inch
          bottom: 72,
          left: 72,
          right: 72
        }
      });

      // Create write stream
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Add document metadata
      doc.info.Title = documentType === 'cover-letter' ? 'Visa Application Cover Letter' : 'Travel Itinerary';
      doc.info.Author = 'Agentic Visa Consultant';
      doc.info.Subject = `${documentType} for ${travelerName}`;
      doc.info.CreationDate = new Date();

      // Add custom header with branding
      doc.font('Helvetica-Bold')
         .fontSize(18)
         .fillColor('#0f62fe')
         .text('Agentic Visa Consultant', { align: 'center' });
      
      doc.moveDown(0.3);
      
      // Add traveler name
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor('#000000')
         .text(`Prepared for: ${travelerName}`, { align: 'center' });
      
      doc.moveDown(0.5);
      
      // Add horizontal line
      doc.moveTo(72, doc.y)
         .lineTo(540, doc.y)
         .lineWidth(2)
         .strokeColor('#0f62fe')
         .stroke();
      
      doc.moveDown(1.5);

      // Reset color for content
      doc.fillColor('#000000');

      // Add document content
      const paragraphs = content.split('\n\n');
      paragraphs.forEach((paragraph) => {
        if (paragraph.trim()) {
          // Check if it's a heading (all caps or starts with "Day")
          if (paragraph.trim().toUpperCase() === paragraph.trim() || paragraph.trim().startsWith('Day ')) {
            doc.font('Helvetica-Bold')
               .fontSize(12)
               .text(paragraph.trim(), { align: 'left' });
            doc.moveDown(0.5);
          } else {
            doc.font('Helvetica')
               .fontSize(11)
               .text(paragraph.trim(), { align: 'justify' });
            doc.moveDown(1);
          }
        }
      });

      // Add footer
      const bottomMargin = 72;
      const pageHeight = doc.page.height;
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#666666')
         .text(
           `Generated by Agentic Visa Consultant on ${new Date().toLocaleDateString()}`,
           72,
           pageHeight - bottomMargin,
           {
             align: 'center',
             width: 468
           }
         );

      // Finalize the PDF
      doc.end();

      // Wait for write to complete
      writeStream.on('finish', () => {
        // Generate URL path (relative to public directory)
        const urlPath = `/downloads/${requestId}/${fileName}`;
        console.log(`✓ PDF created: ${filePath}`);
        console.log(`✓ URL: ${urlPath}`);
        resolve(urlPath);
      });

      writeStream.on('error', (error) => {
        reject(new Error(`Failed to write PDF: ${error.message}`));
      });

    } catch (error) {
      reject(new Error(`Failed to create individual PDF: ${error.message}`));
    }
  });
}

module.exports = {
  generatePDF,
  generateCoverLetterPDF,
  generateItineraryPDF,
  generateCompletePackage,
  createZipArchive,
  generatePDFBuffer,
  createIndividualPDF
};

// Made with Bob
