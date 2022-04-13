import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Category } from '../category/category.model';

interface ProductsCreationAttrs {
  slug: string;
  name: string;
  price: number;
  categoryId: number;
  characteristics: ProductCharacteristic;
  previewImage: string;
  gallery: ProductGallery;
}

export interface ProductCharacteristic {
  [key: string]: string | number | boolean;
}

export interface ProductGallery {
  videos: string[];
  images: [
    {
      preview: string;
      img: string;
    },
  ];
}

@Table({ tableName: 'products' })
export class Product extends Model<Product, ProductsCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  slug: string;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  previewImage: string;

  @Column({
    type: DataType.STRING,
  })
  videos: string;

  @Column({
    type: DataType.JSONB,
  })
  gallery: ProductGallery;

  @Column({
    type: DataType.DOUBLE,
  })
  price: number;

  @Column({ type: DataType.JSONB })
  characteristics: ProductCharacteristic;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER })
  categoryId: number;

  @BelongsTo(() => Category)
  category: Category;
}
