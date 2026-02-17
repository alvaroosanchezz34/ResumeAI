const PDF2Json = require('pdf2json');

const safeDecodeText = (str) => {
    try {
        return decodeURIComponent(str);
    } catch {
        // Si falla el decode, devolver el string tal cual
        return str;
    }
};

const extractPdf = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No PDF file uploaded' });
        }

        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ message: 'PDF too large. Maximum 5MB.' });
        }

        const { text, pages } = await new Promise((resolve, reject) => {
            const parser = new PDF2Json(null, 1);

            parser.on('pdfParser_dataError', (err) => {
                reject(new Error(err?.parserError || 'Failed to parse PDF'));
            });

            parser.on('pdfParser_dataReady', (data) => {
                try {
                    const pdfPages = data?.Pages || [];
                    const lines = [];

                    pdfPages.forEach((page) => {
                        const texts = page?.Texts || [];
                        const lineTexts = texts.map((t) => {
                            const runs = t?.R || [];
                            return runs
                                .map((r) => safeDecodeText(r?.T || ''))
                                .join('');
                        });
                        lines.push(lineTexts.join(' '));
                    });

                    resolve({ text: lines.join('\n\n'), pages: pdfPages.length });
                } catch (e) {
                    reject(e);
                }
            });

            parser.parseBuffer(req.file.buffer);
        });

        const cleaned = text
            .replace(/[ \t]{2,}/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        if (cleaned.length === 0) {
            return res.status(422).json({
                message: 'Could not extract text from this PDF. It may be a scanned image.'
            });
        }

        const truncated = cleaned.length > 8000;
        const finalText = truncated ? cleaned.slice(0, 8000) : cleaned;

        return res.json({
            success: true,
            data: {
                text: finalText,
                chars: finalText.length,
                truncated,
                pages
            }
        });

    } catch (err) {
        console.error('PDF extraction error:', err.message);
        next(err);
    }
};

module.exports = { extractPdf };