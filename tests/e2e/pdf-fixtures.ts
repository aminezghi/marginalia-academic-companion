/** Build tiny standards-valid PDFs for browser tests without committing generated binary files. */
export function createPdfBytes(pageCount: number, includeRasterImage = false): Uint8Array {
  const objects: string[] = [];
  const pageObjectIds = Array.from({ length: pageCount }, (_, index) => 3 + index * 2);
  const fontObjectId = 3 + pageCount * 2;
  const imageObjectId = includeRasterImage ? fontObjectId + 1 : undefined;

  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageCount} >>`;

  pageObjectIds.forEach((pageObjectId, index) => {
    const contentObjectId = pageObjectId + 1;
    const imageResources = imageObjectId ? ` /XObject << /Im0 ${imageObjectId} 0 R >>` : '';
    const imageCommand = imageObjectId && index === 1 ? 'q 240 0 0 240 180 300 cm /Im0 Do Q\n' : '';
    objects[pageObjectId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectId} 0 R >>${imageResources} >> /Contents ${contentObjectId} 0 R >>`;

    const text = `Marginalia test page ${index + 1}`.replace(/[\\()]/g, '\\$&');
    const stream = `BT /F1 18 Tf 72 730 Td (${text}) Tj ET\n${imageCommand}`;
    objects[contentObjectId - 1] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  });

  objects[fontObjectId - 1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  if (imageObjectId) {
    const imageHex = '000000 FFFFFF FF0000 00FF00 0000FF FFFF00 >';
    objects[imageObjectId - 1] = `<< /Type /XObject /Subtype /Image /Width 2 /Height 3 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /ASCIIHexDecode /Length ${imageHex.length} >>\nstream\n${imageHex}\nendstream`;
  }

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}
