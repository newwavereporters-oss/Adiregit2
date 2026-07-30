import React from 'react';
import { Check, Sparkles, Star, ShieldCheck, Tag } from 'lucide-react';

interface FormattedProductDescriptionProps {
  text: string;
  className?: string;
  compact?: boolean;
}

// Common headers to detect and format as section headers
const KNOWN_HEADERS = [
  "Why You'll Love It",
  "Why You Will Love It",
  "Versatile Styling",
  "Perfect For",
  "Make a Statement Without Saying a Word",
  "Premium Features",
  "Key Features",
  "Product Highlights",
  "Fabric & Fit",
  "Care Instructions",
  "Why Choose Us",
  "Product Description",
  "Description",
  "Features",
  "Details",
];

// Helper to check if a phrase is a header
const isKnownHeader = (str: string): boolean => {
  const clean = str.trim().toLowerCase().replace(/[:#]/g, '');
  return KNOWN_HEADERS.some((h) => h.toLowerCase() === clean) || str.trim().endsWith(':');
};

export const FormattedProductDescription: React.FC<FormattedProductDescriptionProps> = ({
  text,
  className = '',
  compact = false,
}) => {
  if (!text) return null;

  // Step 1: Pre-process text to insert newlines before checkmarks and section headers
  let processed = text;

  // Insert linebreaks before checkmarks
  processed = processed.replace(/([^\n])\s*([✔•✓\-*])\s*/g, '$1\n$2 ');

  // Insert linebreaks before known headers if jammed together
  KNOWN_HEADERS.forEach((header) => {
    const regex = new RegExp(`([^\\n])\\s*(${header})`, 'gi');
    processed = processed.replace(regex, '$1\n\n### $2');
  });

  // Split into raw lines / paragraphs
  const rawLines = processed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Group lines into structured blocks
  const blocks: Array<{
    type: 'header' | 'bullet' | 'paragraph' | 'tags';
    content: string;
    items?: string[];
  }> = [];

  rawLines.forEach((line) => {
    // Check if header line
    if (line.startsWith('###') || isKnownHeader(line)) {
      const headerText = line.replace(/^###\s*/, '').replace(/:$/, '').trim();
      blocks.push({ type: 'header', content: headerText });
      return;
    }

    // Check if bullet line (starts with ✔, •, ✓, -, *, or digits like 1.)
    const isBullet = /^[✔•✓\-*\d+\.]/.test(line);
    if (isBullet) {
      const bulletContent = line.replace(/^[✔•✓\-*\d+\.]\s*/, '').trim();
      if (bulletContent) {
        blocks.push({ type: 'bullet', content: bulletContent });
      }
      return;
    }

    // Check if line contains a list of short items separated by spaces/commas under a list section
    const parts = line.split(/(?:,|\s{2,})/).map((p) => p.trim()).filter((p) => p.length > 0);
    const lastBlock = blocks[blocks.length - 1];
    if (
      parts.length >= 3 &&
      parts.every((p) => p.length < 35) &&
      lastBlock &&
      (lastBlock.content.toLowerCase().includes('perfect for') ||
        lastBlock.content.toLowerCase().includes('versatile') ||
        lastBlock.content.toLowerCase().includes('styling'))
    ) {
      blocks.push({ type: 'tags', content: line, items: parts });
      return;
    }

    // Regular paragraph
    blocks.push({ type: 'paragraph', content: line });
  });

  if (compact) {
    // Compact mode for small preview spaces
    return (
      <div className={`space-y-2 text-xs text-gray-600 leading-relaxed ${className}`}>
        {blocks.slice(0, 3).map((block, idx) => {
          if (block.type === 'bullet') {
            return (
              <div key={idx} className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#D1B464] shrink-0 mt-0.5" />
                <span>{block.content}</span>
              </div>
            );
          }
          if (block.type === 'header') {
            return (
              <span key={idx} className="font-bold text-[#1B2A4A] block pt-1">
                {block.content}
              </span>
            );
          }
          return <p key={idx}>{block.content}</p>;
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-4 text-gray-700 ${className}`}>
      {blocks.map((block, index) => {
        if (block.type === 'header') {
          return (
            <div
              key={index}
              className="flex items-center gap-2.5 pt-4 pb-1 border-b border-gray-100 first:pt-0"
            >
              <div className="w-2 h-5 bg-[#D1B464] rounded-full shrink-0" />
              <h4 className="font-serif-title text-base sm:text-lg font-bold text-[#1B2A4A] tracking-wide">
                {block.content}
              </h4>
            </div>
          );
        }

        if (block.type === 'bullet') {
          // Check if bullet content has title vs body (e.g. "Exclusive Design Own a design that...")
          // Split by colon or first sentence/phrase
          let titlePart = '';
          let bodyPart = block.content;

          if (block.content.includes(':')) {
            const [t, ...rest] = block.content.split(':');
            titlePart = t.trim();
            bodyPart = rest.join(':').trim();
          } else {
            // Attempt to bold first 2-5 capital words if it looks like a title
            const match = block.content.match(/^([A-Z][a-zA-Z0-9'–\s]{3,35}?)(?=\s+[A-Z0-9a-z\.,]|$)/);
            if (match && match[1] && match[1].length < block.content.length - 10) {
              titlePart = match[1].trim();
              bodyPart = block.content.slice(match[1].length).trim();
            }
          }

          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#FAFAFA] border border-gray-200/80 hover:border-[#D1B464]/50 transition-all shadow-2xs"
            >
              <div className="w-6 h-6 rounded-full bg-[#1B2A4A] text-[#D1B464] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed flex-1">
                {titlePart ? (
                  <>
                    <span className="font-bold text-[#1B2A4A] block mb-0.5">{titlePart}</span>
                    <span className="text-gray-600 font-light">{bodyPart}</span>
                  </>
                ) : (
                  <span className="text-gray-700">{bodyPart}</span>
                )}
              </div>
            </div>
          );
        }

        if (block.type === 'tags' && block.items) {
          return (
            <div key={index} className="flex flex-wrap gap-2 pt-1 pb-2">
              {block.items.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-[#1B2A4A] shadow-2xs hover:border-[#D1B464] transition-colors"
                >
                  <Tag className="w-3 h-3 text-[#D1B464]" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          );
        }

        return (
          <p
            key={index}
            className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal tracking-wide"
          >
            {block.content}
          </p>
        );
      })}
    </div>
  );
};
