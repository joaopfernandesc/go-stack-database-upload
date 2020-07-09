import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findOrCreateCategory(title: string): Promise<string> {
    const findCategory = await this.findOne({
      where: { title },
    });

    if (findCategory) {
      return findCategory.id;
    }
    const createdCategory = this.create({
      title,
    });

    await this.save(createdCategory);

    return createdCategory.id;
  }
}

export default CategoriesRepository;
