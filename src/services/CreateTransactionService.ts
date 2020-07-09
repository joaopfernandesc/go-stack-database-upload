import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  title: string;
  value: number;
  category: string;
  type: 'income' | 'outcome';
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    category,
    type,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const category_id = await categoriesRepository.findOrCreateCategory(
      category,
    );

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Not enough funds.');
    }

    const transaction = transactionsRepository.create({
      category_id,
      title,
      value,
      type,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
