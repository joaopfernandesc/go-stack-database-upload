import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(uuid: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const transactionToRemove = await transactionRepository.findOne(uuid);
    if (!transactionToRemove) {
      throw new AppError('Specified transaction not find');
    }

    await transactionRepository.remove(transactionToRemove);
  }
}

export default DeleteTransactionService;
