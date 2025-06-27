import { Test, TestingModule } from '@nestjs/testing';
import { PdfReportService } from './pdf-report.service';

describe('PdfReportService', () => {
  let service: PdfReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfReportService],
    }).compile();

    service = module.get<PdfReportService>(PdfReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
