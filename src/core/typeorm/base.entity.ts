import {
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { autoSlug } from '../middlewares/auto-slug.middleware';
import { autoHashPassword } from '../middlewares/auto-hash-password.middleware';
import { autoTrim } from '../middlewares/auto-trim.middleware';

export class BaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  handleAutoSlug() {
    autoSlug(this);
  }

  @BeforeInsert()
  @BeforeUpdate()
  handleHashPassword() {
    autoHashPassword(this);
  }

  @BeforeInsert()
  @BeforeUpdate()
  autoTrimProperties() {
    autoTrim(this);
  }
}
