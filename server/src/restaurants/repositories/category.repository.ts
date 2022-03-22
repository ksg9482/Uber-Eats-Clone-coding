import { EntityRepository, Repository } from "typeorm";
import { Category } from "../entities/category.entity";

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
    
    async getOrCreate(name: string):Promise<Category> {
        const categoryName = name
        .trim() //앞뒤 빈칸을 제거 
        .toLowerCase()
        const categorySlug = categoryName.replace(/ /g, '-'); //regular expresstion을 만족시키기
        let category = await this.findOne({slug: categorySlug});
        if(!category) {
            category = await this.save(this.create({slug: categorySlug, name:categoryName}))
        } 

        return category;
    };

}