import { Result } from '@badrap/result'
import { CommandHandler } from '@nestjs/cqrs'
import path from 'path'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { DeletePdfFilesCommand } from './delete-pdf-files.command'
import fs = require('fs')

@CommandHandler(DeletePdfFilesCommand)
export class DeletePdfFilesCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
  ) {
    super(unitOfWork)
  }

  async handle(command: DeletePdfFilesCommand) : Promise<Result<String, ExceptionBase>> {
    // Get the root directory of the project
    const projectRoot = process.cwd();

    // Delete PDF files at project root
    for (const file of fs.readdirSync(projectRoot)) {
      if (file.endsWith('.pdf')) {
        fs.unlinkSync(path.join(projectRoot, file));
      }
    }

    return Result.ok("Success");

  }
}
