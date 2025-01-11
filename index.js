const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const app = express();
const port = 3000;

app.get("/capture-screenshot", async (req, res) => {
  try {
    // Get the URL from query parameters
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("URL parameter is required.");
    }

    // Launch Puppeteer browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle0" });

    // Set the viewport for desktop resolution
    await page.setViewport({ width: 1920, height: 1080 });

    // Define the path to save the screenshot temporarily
    const screenshotPath = path.join(
      __dirname,
      "Lilliana Learner - VISTA USD Learner Portrait.png"
    );

    // Capture the full page screenshot
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Close the browser
    await browser.close();

    // Convert the PNG screenshot to PDF
    const pdfDoc = await PDFDocument.create();
    const pngBytes = fs.readFileSync(screenshotPath);

    // Embed the PNG image in the PDF document
    const pngImage = await pdfDoc.embedPng(pngBytes);
    const page1 = pdfDoc.addPage([pngImage.width, pngImage.height]);
    page1.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pngImage.width,
      height: pngImage.height,
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // Set the response headers to indicate a file download
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Lilliana Learner - VISTA USD Learner Portrait.pdf"'
    );
    res.setHeader("Content-Type", "application/pdf");

    // Send the PDF bytes as the response
    res.end(pdfBytes);

    // Optionally, clean up the screenshot file after processing
    res.on("finish", () => {
      fs.unlinkSync(screenshotPath); // Remove the screenshot file after sending
    });
  } catch (error) {
    console.error("Error capturing screenshot or converting to PDF:", error);
    res.status(500).send("Error capturing screenshot or converting to PDF");
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
