import {
  BadRequestException,
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Article } from './articles.model';
import { CreateArticleDto } from './dto/create-acticle-dto';
import { UpdateArticleDto } from './dto/update-acticle-dto';
import { IdDto } from '../../validation/id-dto';
import * as slug from 'slug';
import { ArticlesCategoriesService } from '../articles-categories/articles-categories.service';
import { FilesService } from '../files/files.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article) private articleRepository: typeof Article,
    private articlesCategoryService: ArticlesCategoriesService,
    private filesService: FilesService,
  ) {}

  async createArticle(dto: CreateArticleDto) {
    const category = await this.articlesCategoryService.getCategoryByPk(
      dto.categoryId,
    );

    if (!category) {
      throw new BadRequestException('Выбранная категория статей отсутствует');
    }

    let previewImage: string;
    // TODO: Сделать сохранение контентных картинок
    let contentImages: string[];

    try {
      const previewImageFile = await this.filesService.getFileById(
        dto.previewImage,
      );

      if (!previewImageFile) {
        throw new RequestTimeoutException(
          'Время заполнения формы вышло, перезагрузите страницу',
        );
      }
      previewImage = await this.filesService.saveFile(
        previewImageFile.filename,
      );

      const slug = await this.getSlug(dto.name);

      await this.articleRepository.create({
        ...dto,
        slug,
        previewImage,
        content: JSON.stringify(dto.content),
      });

      return 'Статья успешно создана';
    } catch (e) {
      if (previewImage) {
        this.filesService.deleteFile(previewImage);
      }
      throw e;
    }
  }

  async updateArticle(dto: UpdateArticleDto, articleId: IdDto) {
    const article = await this.articleRepository.findByPk(articleId.id);

    if (!article) {
      throw new NotFoundException('Указанная статья не существует');
    }

    let previewImage: string;
    let contentImages: string[];

    try {
      if (dto.previewImage) {
        previewImage = await this.savePreviewImage(dto.previewImage);
        article.previewImage = previewImage;
      }

      if (dto.content) {
        // TODO: Обновление контентных картинок
        article.content = JSON.stringify(dto.content);
      }

      if (dto.previewText) {
        article.previewText = dto.previewText;
      }

      if (dto.name) {
        article.slug = await this.getSlug(dto.name);
      }

      await article.save();

      return 'Статья успешно удалена';
    } catch (e) {
      throw e;
    }
  }

  async deleteArticle(articleId: IdDto) {
    const article = await this.articleRepository.findByPk(articleId.id);

    if (article) {
      // TODO: Удалить контентные картинки
      this.filesService.deleteFile(article.previewImage);
      await article.destroy();
    }

    return 'Статья успешно удалена';
  }

  async getArticleBySlug(slug: string) {
    const category = await this.articleRepository.findOne({
      where: { slug },
      rejectOnEmpty: false,
    });
    return category;
  }

  private async getSlug(str: string): Promise<string> {
    let availableSlug = false;
    let slugCounter = 1;
    let slugStr = slug(str);

    while (!availableSlug) {
      const duplicatedCategoryBySlug = await this.getArticleBySlug(slugStr);

      if (!duplicatedCategoryBySlug) {
        availableSlug = true;
      } else {
        slugStr = slug(`${str}-${slugCounter}`);
        slugCounter++;
      }
    }

    return slugStr;
  }

  private async savePreviewImage(imageId: number) {
    const previewImageFile = await this.filesService.getFileById(imageId);

    if (!previewImageFile) {
      throw new RequestTimeoutException(
        'Время заполнения формы вышло, перезагрузите страницу',
      );
    }

    if (
      !previewImageFile.filename.endsWith('.jpg') &&
      !previewImageFile.filename.endsWith('.png')
    ) {
      throw new BadRequestException(
        'Изображение должно быть в формате JPG или PNG',
      );
    }

    return await this.filesService.saveFile(previewImageFile.filename);
  }
}