import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfReportService {
  async generateLoginReport(logs: any[]): Promise<Uint8Array> {
    const html = this.buildLoginReportHtml(logs);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();
    return pdfBuffer;
  }

  public buildLoginReportHtml(logs: any[]): string {
    const rows = logs
      .map(
        (log, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${log.user?.name ?? '-'}</td>
          <td>${log.loginAt?.toLocaleString()}</td>
          <td>${log.logoutAt?.toLocaleString() ?? '-'}</td>
          <td>${log.ipAddress ?? '-'}</td>
        </tr>
      `,
      )
      .join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>📋 รายงานการเข้าใช้งานประจำเดือน</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ชื่อผู้ใช้</th>
                <th>เวลาเข้า</th>
                <th>เวลาออก</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;
  }
}
