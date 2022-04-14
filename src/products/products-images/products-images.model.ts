import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Product } from '../products.model';

interface ProductsImagesCreationAttrs {
  bigImage: string;
  mediumImage: string;
  smallImage: string;
  productId: number;
}

@Table({ tableName: 'products_images' })
export class ProductImage extends Model<
  ProductImage,
  ProductsImagesCreationAttrs
> {
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
  smallImage: string;

  @Column({
    type: DataType.STRING,
  })
  mediumImage: string;

  @Column({
    type: DataType.STRING,
  })
  bigImage: string;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER })
  productId: number;

  @BelongsTo(() => Product)
  product: Product;
}
