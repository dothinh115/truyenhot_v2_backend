import { CommonService } from '../common/common.service';

export function autoSlug(
  entity: any,
  object: { field: string } = { field: 'title' },
) {
  const { field } = object;
  if (entity[field]) {
    const commonService = new CommonService();
    entity.slug = commonService.toSlug(entity[field]);
  }
}
