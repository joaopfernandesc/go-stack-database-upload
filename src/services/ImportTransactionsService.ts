import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface ImportedTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const importedTransactions: ImportedTransaction[] = [];
    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transactions: Transaction[] = [];
    const categories = await categoriesRepository
      .createQueryBuilder('categories')
      .select(['categories.title, categories.id'])
      .getRawMany();

    console.log('Categories:', categories);
    const categoriesId: Record<string, any> = {};

    const parseCsv = fs
      .createReadStream(filePath)
      .pipe(csvParse({ from_line: 2 }));

    parseCsv.on('data', async row => {
      const [title, type, value, category] = row.map((cell: string) =>
        cell.trim(),
      );

      if (!categories.find(item => item.title === category)) {
        categories.push({ title: category, id: '' });
      }
      importedTransactions.push({
        title,
        value: parseInt(value, 10),
        type,
        category,
      });
    });

    await new Promise(resolve => parseCsv.on('end', resolve));

    categories.map(async item => {
      if (item.id === '') {
        const category_id = await new Promise(resolve =>
          categoriesRepository.findOrCreateCategory(item.title),
        );
        categoriesId[item.title] = category_id;
      } else {
        categoriesId[item.title] = item.id;
      }
    });

    const createdTransaction = transactionsRepository.create(
      importedTransactions.map(item => {
        return {
          title: item.title,
          value: item.value,
          type: item.type,
          category_id: categoriesId[item.category],
        };
      }),
    );

    await transactionsRepository.save(createdTransaction);
    await fs.promises.unlink(filePath);

    return transactions;
  }
}

export default ImportTransactionsService;
