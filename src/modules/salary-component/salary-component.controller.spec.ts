import { Test, TestingModule } from '@nestjs/testing';
import { SalaryComponentController } from './salary-component.controller';

describe('SalaryComponentController', () => {
  let controller: SalaryComponentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalaryComponentController],
    }).compile();

    controller = module.get<SalaryComponentController>(SalaryComponentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
