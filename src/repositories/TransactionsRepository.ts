import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const query = await this.createQueryBuilder('transactions')
      .select('transactions.type')
      .addSelect('SUM(transactions.value)', 'total')
      .groupBy('transactions.type')
      .getRawMany();

    let outcome = 0;
    let income = 0;

    query.map(item => {
      if (item.transactions_type === 'income') {
        income = parseInt(item.total, 10);
      } else {
        outcome = parseInt(item.total, 10);
      }

      return null;
    });

    return { income, outcome, total: income - outcome };
  }
}

export default TransactionsRepository;
